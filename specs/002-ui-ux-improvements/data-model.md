# Phase 1: Data Model

**Feature**: UI/UX Improvements (v2.0.0)  
**Branch**: 002-ui-ux-improvements  
**Date**: 2024

---

## 1. Existing SQLite Schema (v1.0.0 - No Changes)

**Database File**: `./data/news.db`

### Table: `articles`

```sql
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  published_at TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ai_summary TEXT,
  ai_tags TEXT,  -- JSON array stored as text: '["tag1", "tag2"]'
  scraped_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_published_at ON articles(published_at);
CREATE INDEX idx_source_name ON articles(source_name);
CREATE INDEX idx_scraped_at ON articles(scraped_at);
```

### Table: `sources`

```sql
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('rss', 'atom', 'webpage')),
  category TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_scraped_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Backward Compatibility**: ✅ No schema changes required. v2 only adds new read/write patterns (batch AI updates, filter queries).

---

## 2. Filter State Schema (localStorage - New in v2)

**Storage Key**: `news-harvester-filters`  
**Format**: JSON serialized object  
**Max Size**: ~1KB (well within 5MB localStorage limit)  
**Persistence**: Across browser sessions, per-user basis

### TypeScript Interface

```typescript
// types/filters.ts
export interface FilterState {
  /** Date range filter (null = no filter) */
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  
  /** Array of source names (empty = all sources) */
  selectedSources: string[];
  
  /** Array of tag strings (empty = all tags) */
  selectedTags: string[];
  
  /** Last update timestamp (for debugging) */
  lastUpdated?: string;  // ISO 8601 timestamp
}
```

### Storage Format (JSON)

```json
{
  "dateRange": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-01-31T23:59:59.999Z"
  },
  "selectedSources": ["Hacker News", "TechCrunch"],
  "selectedTags": ["AI", "Web Development", "Security"],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### Validation Rules

1. **Date Range**:
   - `from` must be ≤ `to` (enforced in UI)
   - Stored as ISO 8601 strings, parsed to Date objects on load
   - `null` values indicate no date filter applied

2. **Selected Sources**:
   - Array of source names (matches `sources.name` column)
   - Empty array `[]` = all sources visible
   - Invalid source names (deleted sources) filtered out on load

3. **Selected Tags**:
   - Array of lowercase tag strings (matches `articles.ai_tags` values)
   - Empty array `[]` = all tags visible
   - Duplicate tags prevented in UI

4. **Size Constraints**:
   - Max 50 sources selected (realistic UI limit: ~10)
   - Max 100 tags selected (realistic UI limit: ~20)
   - Total JSON size < 5KB (enforced before save)

### Error Handling

```typescript
// lib/utils/localStorage.ts
export function saveFilterState(state: FilterState): boolean {
  try {
    const serialized = JSON.stringify({
      ...state,
      dateRange: {
        from: state.dateRange.from?.toISOString() || null,
        to: state.dateRange.to?.toISOString() || null
      },
      lastUpdated: new Date().toISOString()
    });
    
    if (serialized.length > 5000) {
      console.warn('Filter state exceeds 5KB, truncating tags');
      state.selectedTags = state.selectedTags.slice(0, 20);
      return saveFilterState(state); // Retry with truncated data
    }
    
    localStorage.setItem(FILTER_STATE_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Fallback: clear old filter state
      localStorage.removeItem(FILTER_STATE_KEY);
    }
    return false;
  }
}

export function loadFilterState(): FilterState | null {
  try {
    const stored = localStorage.getItem(FILTER_STATE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      dateRange: {
        from: parsed.dateRange.from ? new Date(parsed.dateRange.from) : null,
        to: parsed.dateRange.to ? new Date(parsed.dateRange.to) : null
      },
      selectedSources: Array.isArray(parsed.selectedSources) ? parsed.selectedSources : [],
      selectedTags: Array.isArray(parsed.selectedTags) ? parsed.selectedTags : [],
      lastUpdated: parsed.lastUpdated
    };
  } catch (error) {
    console.error('Failed to parse filter state, resetting', error);
    localStorage.removeItem(FILTER_STATE_KEY);
    return null;
  }
}
```

---

## 3. AI Refresh Session State (Server Memory - New in v2)

**Storage**: In-memory Map on Next.js server  
**Lifetime**: Duration of batch refresh operation (~5-10 seconds)  
**Purpose**: Track progress and enable cancellation

### TypeScript Interface

```typescript
// app/api/ai-refresh/types.ts
export interface RefreshSession {
  /** Unique session identifier (UUID) */
  sessionId: string;
  
  /** Array of article IDs to process */
  articleIds: string[];
  
  /** Number of articles processed so far */
  progress: number;
  
  /** Total number of articles in batch */
  total: number;
  
  /** Abort controller for cancellation */
  controller: AbortController;
  
  /** Session start timestamp */
  startedAt: Date;
  
  /** Session status */
  status: 'in-progress' | 'completed' | 'cancelled' | 'error';
  
  /** Error message if status = 'error' */
  error?: string;
}
```

### State Transitions

```
┌──────────────┐
│   Created    │  sessionId generated, controller initialized
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ In Progress  │  Processing articles in batches of 5
└──┬────────┬──┘
   │        │
   │        └────────────► Cancelled  (DELETE request received)
   │
   ├─────────────────────► Error      (LLM API failure, network timeout)
   │
   └─────────────────────► Completed  (All articles processed)
```

### Memory Management

```typescript
// app/api/ai-refresh/session-manager.ts
const refreshSessions = new Map<string, RefreshSession>();

// Auto-cleanup completed sessions after 30 seconds
export function cleanupSession(sessionId: string): void {
  setTimeout(() => {
    const session = refreshSessions.get(sessionId);
    if (session && (session.status === 'completed' || session.status === 'error')) {
      refreshSessions.delete(sessionId);
    }
  }, 30_000);
}

// Cleanup on server restart (Next.js Hot Reload)
if (process.env.NODE_ENV === 'development') {
  process.on('beforeExit', () => {
    refreshSessions.clear();
  });
}
```

---

## 4. Updated Article Query Patterns (SQLite)

### Existing v1 Query (Unfiltered)

```typescript
// lib/db/queries.ts (v1.0.0)
export function getAllArticles(): Article[] {
  const stmt = db.prepare(`
    SELECT * FROM articles 
    ORDER BY published_at DESC
  `);
  return stmt.all();
}
```

### New v2 Query (Filtered)

```typescript
// lib/db/queries.ts (v2.0.0 - Enhanced)
export interface ArticleFilters {
  dateRange?: { from: Date | null; to: Date | null };
  sources?: string[];
  tags?: string[];
}

export function getFilteredArticles(filters: ArticleFilters): Article[] {
  let sql = 'SELECT * FROM articles WHERE 1=1';
  const params: any[] = [];
  
  // Date range filter
  if (filters.dateRange?.from) {
    sql += ' AND published_at >= ?';
    params.push(filters.dateRange.from.toISOString());
  }
  if (filters.dateRange?.to) {
    sql += ' AND published_at <= ?';
    params.push(filters.dateRange.to.toISOString());
  }
  
  // Source filter (IN clause)
  if (filters.sources && filters.sources.length > 0) {
    sql += ` AND source_name IN (${filters.sources.map(() => '?').join(',')})`;
    params.push(...filters.sources);
  }
  
  // Tag filter (JSON array contains)
  if (filters.tags && filters.tags.length > 0) {
    const tagConditions = filters.tags.map(() => 
      `ai_tags LIKE ?`
    ).join(' AND ');
    sql += ` AND (${tagConditions})`;
    params.push(...filters.tags.map(tag => `%"${tag}"%`));
  }
  
  sql += ' ORDER BY published_at DESC';
  
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}
```

**Performance Notes**:
- Date range uses existing `idx_published_at` index (no new index needed)
- Source filter uses existing `idx_source_name` index
- Tag filter is full table scan (acceptable for <10K articles), consider full-text search if >100K articles

---

## 5. Batch AI Update Pattern (SQLite)

### New Transaction for Batch Updates

```typescript
// lib/db/mutations.ts (v2.0.0 - New)
export function updateArticleAIContent(
  articleId: string, 
  aiSummary: string, 
  aiTags: string[]
): void {
  const stmt = db.prepare(`
    UPDATE articles 
    SET ai_summary = ?, 
        ai_tags = ?
    WHERE id = ?
  `);
  stmt.run(aiSummary, JSON.stringify(aiTags), articleId);
}

export function batchUpdateArticleAI(
  updates: Array<{ articleId: string; aiSummary: string; aiTags: string[] }>
): void {
  const updateStmt = db.prepare(`
    UPDATE articles 
    SET ai_summary = ?, 
        ai_tags = ?
    WHERE id = ?
  `);
  
  const transaction = db.transaction((items) => {
    for (const item of items) {
      updateStmt.run(item.aiSummary, JSON.stringify(item.aiTags), item.articleId);
    }
  });
  
  transaction(updates);  // Executes as single atomic transaction
}
```

**Transaction Benefits**:
- All 5 updates in batch succeed or fail together
- ~10x faster than individual UPDATE statements (SQLite WAL mode)
- Prevents partial updates if process crashes mid-batch

---

## 6. Data Validation Rules

### Article Entity (No Changes from v1)

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | UUID v4 format |
| `title` | TEXT | NOT NULL | 1-500 characters |
| `url` | TEXT | NOT NULL, UNIQUE | Valid HTTP/HTTPS URL |
| `published_at` | TEXT | NOT NULL | ISO 8601 datetime |
| `ai_summary` | TEXT | NULLABLE | 0-2000 characters |
| `ai_tags` | TEXT | NULLABLE | JSON array, 0-20 tags |

### Source Entity (No Changes from v1)

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | N/A |
| `name` | TEXT | NOT NULL | 1-100 characters |
| `url` | TEXT | NOT NULL, UNIQUE | Valid RSS/Atom feed URL |
| `type` | TEXT | NOT NULL, CHECK | Enum: 'rss', 'atom', 'webpage' |
| `enabled` | INTEGER | NOT NULL, DEFAULT 1 | 0 or 1 (boolean) |

### Filter State (New in v2)

| Field | Type | Constraints | Validation |
|-------|------|-------------|------------|
| `dateRange.from` | Date\|null | NULLABLE | ≤ `to` if both set |
| `dateRange.to` | Date\|null | NULLABLE | ≥ `from` if both set |
| `selectedSources` | string[] | NOT NULL | Each element matches existing source name |
| `selectedTags` | string[] | NOT NULL | Each element is lowercase, 2-50 chars |

---

## Summary

### Schema Changes: **None** ✅
- v2 is 100% backward compatible with v1.0.0 SQLite schema
- Existing indexes sufficient for new filter queries

### New Data Structures:
1. **FilterState** (localStorage) - User preferences persistence
2. **RefreshSession** (server memory) - Batch AI progress tracking

### Query Enhancements:
- `getFilteredArticles()` - Multi-dimensional filtering (date + source + tags)
- `batchUpdateArticleAI()` - Transactional batch updates

**Next Phase**: Phase 1 Contracts will define API endpoints for `/api/ai-refresh` and update `/api/articles` to accept filter parameters.
