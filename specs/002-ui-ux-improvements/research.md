# Phase 0: Research & Design Decisions

**Feature**: UI/UX Improvements (v2.0.0)  
**Branch**: 002-ui-ux-improvements  
**Date**: 2024

---

## 1. Filter State Persistence Strategy

### Decision: localStorage with JSON serialization

**Rationale**:
- **Simplicity**: No additional dependencies, native Web API
- **Performance**: Synchronous read/write, sub-millisecond access time
- **Compatibility**: Supported in all modern browsers, backward compatible with v1 (graceful degradation)
- **Scope**: Filter state is ~1KB (date range + 2-5 sources + 5-10 tags), well within 5MB limit

**Implementation Pattern**:
```typescript
// lib/utils/localStorage.ts
interface FilterState {
  dateRange: { from: Date | null; to: Date | null };
  selectedSources: string[];
  selectedTags: string[];
}

export const FILTER_STATE_KEY = 'news-harvester-filters';

export function saveFilterState(state: FilterState): void {
  localStorage.setItem(FILTER_STATE_KEY, JSON.stringify({
    ...state,
    dateRange: {
      from: state.dateRange.from?.toISOString(),
      to: state.dateRange.to?.toISOString()
    }
  }));
}

export function loadFilterState(): FilterState | null {
  const stored = localStorage.getItem(FILTER_STATE_KEY);
  if (!stored) return null;
  const parsed = JSON.parse(stored);
  return {
    ...parsed,
    dateRange: {
      from: parsed.dateRange.from ? new Date(parsed.dateRange.from) : null,
      to: parsed.dateRange.to ? new Date(parsed.dateRange.to) : null
    }
  };
}
```

**Alternatives Considered**:
1. **IndexedDB** - Rejected: Overkill for <1KB data, async API adds complexity
2. **sessionStorage** - Rejected: Clears on tab close, doesn't meet "persist across sessions" requirement
3. **Cookies** - Rejected: Sent with every HTTP request (performance overhead), 4KB limit restrictive
4. **URL query parameters** - Rejected: Poor UX (long URLs), doesn't persist across navigation

---

## 2. Batch AI Refresh Architecture

### Decision: Server-side queue with client-side progress polling

**Rationale**:
- **Cost Control**: Process 5 articles/batch reduces LLM API calls (¥0.01/article × 5 = ¥0.05/batch)
- **Cancellation**: Server maintains abort signal, client can cancel via DELETE request
- **Progress Feedback**: Server tracks processed count, client polls every 500ms
- **Error Resilience**: Individual article failures don't block batch, errors aggregated in Toast

**Implementation Pattern**:
```typescript
// app/api/ai-refresh/route.ts
export async function POST(req: Request) {
  const { articleIds } = await req.json(); // Array of article IDs
  const sessionId = crypto.randomUUID();
  const controller = new AbortController();
  
  refreshSessions.set(sessionId, { controller, progress: 0, total: articleIds.length });

  // Process in background
  processAIRefreshBatch(articleIds, controller.signal, sessionId);
  
  return NextResponse.json({ sessionId, total: articleIds.length });
}

export async function GET(req: Request) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const session = refreshSessions.get(sessionId);
  return NextResponse.json({ progress: session.progress, total: session.total });
}

export async function DELETE(req: Request) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const session = refreshSessions.get(sessionId);
  session.controller.abort();
  return NextResponse.json({ cancelled: true });
}
```

**Alternatives Considered**:
1. **WebSocket real-time updates** - Rejected: Adds infrastructure complexity, overkill for 5-10 second operations
2. **Process all articles in single request** - Rejected: Would exceed Vercel 10s serverless timeout, no progress feedback
3. **Client-side batch processing** - Rejected: Exposes LLM API keys, no cancellation during network failure

---

## 3. Toast Notification Component

### Decision: react-hot-toast with custom styling

**Rationale**:
- **Lightweight**: 4KB gzipped, no peer dependencies
- **Accessibility**: Built-in ARIA labels, keyboard dismissal (Esc)
- **Customization**: Supports Tailwind classes, matches design system
- **Promise Integration**: Built-in `.promise()` method for async operations (scraping feedback)

**Installation**: `npm install react-hot-toast@2.4.1`

**Integration Pattern**:
```typescript
// app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1F2937',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
          }}
        />
      </body>
    </html>
  );
}

// Usage in components/ai-refresh
import toast from 'react-hot-toast';

toast.promise(
  fetch('/api/ai-refresh', { method: 'POST', body: JSON.stringify({ articleIds }) }),
  {
    loading: 'Refreshing AI summaries...',
    success: (res) => `${res.count} articles updated`,
    error: 'Failed to refresh summaries'
  }
);
```

**Alternatives Considered**:
1. **Custom Toast component** - Rejected: Reinventing accessibility, animation logic
2. **react-toastify** - Rejected: Larger bundle (12KB), jQuery-like imperative API
3. **Chakra UI Toast** - Rejected: Requires full Chakra UI dependency (>100KB)

---

## 4. CSS Gradient & Glassmorphism Techniques

### Decision: Tailwind custom utilities with CSS backdrop-filter

**Rationale**:
- **Native Performance**: backdrop-filter uses GPU acceleration, 60fps animations
- **Design System Integration**: Gradient defined once in `tailwind.config.ts`, reusable across components
- **Browser Support**: 95%+ coverage (Chrome 76+, Safari 14+, Firefox 103+), graceful degradation with solid fallback

**Tailwind Configuration**:
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        gradient: {
          start: '#3B82F6', // Blue-500
          end: '#6366F1',   // Indigo-500
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.18)',
        }
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
      },
      backdropBlur: {
        xs: '2px',
      }
    }
  }
};
```

**Usage in Components**:
```tsx
// components/Header.tsx
<header className="bg-header-gradient shadow-md">
  {/* Gradient header */}
</header>

// components/FilterBar.tsx (glassmorphism card)
<div className="bg-glass-bg backdrop-blur-sm border border-glass-border rounded-lg">
  {/* Glassmorphism effect */}
</div>
```

**Alternatives Considered**:
1. **Inline CSS gradients** - Rejected: Not DRY, harder to maintain consistency
2. **CSS-in-JS libraries (styled-components)** - Rejected: Adds runtime overhead, conflicts with Tailwind philosophy
3. **SVG gradients** - Rejected: Overkill for simple linear gradients, accessibility concerns

---

## 5. FilterBar Component Decomposition

### Decision: Split into DatePicker, SourceFilter, TagFilter sub-components

**Rationale**:
- **Separation of Concerns**: Each filter type has distinct logic (date range picker vs. multi-select checkboxes)
- **Reusability**: Sub-components can be used independently in future features (e.g., advanced search modal)
- **Testability**: Unit test each filter type in isolation
- **Code Clarity**: Original FilterBar.tsx ~300 lines → 4 files of ~80 lines each

**Component Structure**:
```
components/FilterBar/
├── index.tsx           # Main container, filter state orchestration
├── DatePicker.tsx      # Date range picker with clear button
├── SourceFilter.tsx    # Source checkboxes with badge count + clear
└── TagFilter.tsx       # Tag pills with individual × clear buttons
```

**Communication Pattern**:
```typescript
// Parent (FilterBar/index.tsx)
export default function FilterBar() {
  const { filters, updateFilters, clearFilters } = useFilterState();
  
  return (
    <div className="flex gap-4">
      <DatePicker 
        value={filters.dateRange} 
        onChange={(range) => updateFilters({ dateRange: range })}
        onClear={() => updateFilters({ dateRange: { from: null, to: null } })}
      />
      <SourceFilter 
        selected={filters.selectedSources}
        onChange={(sources) => updateFilters({ selectedSources: sources })}
        onClear={() => updateFilters({ selectedSources: [] })}
      />
      <TagFilter 
        selected={filters.selectedTags}
        onChange={(tags) => updateFilters({ selectedTags: tags })}
        onClearTag={(tag) => updateFilters({ 
          selectedTags: filters.selectedTags.filter(t => t !== tag) 
        })}
      />
      <button onClick={clearFilters}>Reset All</button>
    </div>
  );
}
```

**Alternatives Considered**:
1. **Keep monolithic FilterBar** - Rejected: 300+ line files hard to navigate, merge conflicts likely
2. **Use compound components pattern** - Rejected: Over-engineering for simple filter UI, TypeScript complexity
3. **Extract only TagFilter** - Rejected: Inconsistent decomposition, doesn't address full complexity

---

## 6. Real RSS Sources Pre-configuration

### Decision: Embed 5 diverse RSS feeds in seed script

**Rationale**:
- **User Experience**: Users see 20-30 articles immediately on first load (FR-030)
- **Domain Diversity**: Mix of tech, news, blogs ensures broad appeal
- **Reliability**: Selected sources with stable RSS feeds, minimal downtime
- **Performance**: Pre-seeding in init script is one-time cost (~5s startup delay acceptable)

**Selected RSS Sources**:
```typescript
// lib/db/init.ts
const DEFAULT_RSS_SOURCES = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'research' },
  { name: 'ArXiv CS', url: 'http://export.arxiv.org/rss/cs', category: 'research' }
];
```

**Initial Scraping Strategy**:
```typescript
// On first app launch (detected by empty articles table)
async function seedInitialArticles() {
  for (const source of DEFAULT_RSS_SOURCES) {
    const articles = await scrapeRSS(source.url);
    const limited = articles.slice(0, 6); // 6 articles per source = 30 total
    await db.insertArticles(limited);
  }
}
```

**Alternatives Considered**:
1. **User must manually add sources first** - Rejected: Poor onboarding UX, friction to value
2. **Single default source (e.g., Hacker News only)** - Rejected: Too narrow, limits tag diversity
3. **10+ default sources** - Rejected: Initial scraping >10s startup delay, overwhelming UI
4. **Random article API (NewsAPI)** - Rejected: Violates "no mock data" requirement, introduces API dependency

---

## Summary of Technical Unknowns Resolved

| Requirement | Technical Unknown | Resolution |
|-------------|------------------|------------|
| FR-024-025 | How to persist filter state? | localStorage with JSON serialization |
| FR-016 | How to implement batch AI refresh? | Server-side queue + client polling, 5 articles/batch |
| FR-029 | Which Toast library? | react-hot-toast (4KB, accessible, promise-friendly) |
| Design System | How to implement gradients? | Tailwind custom utilities + backdrop-filter |
| FR-019-022 | How to structure FilterBar? | Decompose into 3 sub-components (DatePicker, SourceFilter, TagFilter) |
| FR-030 | Which RSS sources to pre-configure? | 5 diverse sources (tech + research), 6 articles each |

**Next Phase**: Phase 1 will document data models (localStorage schema + SQLite backward compatibility) and generate API contracts for `/api/ai-refresh`.
