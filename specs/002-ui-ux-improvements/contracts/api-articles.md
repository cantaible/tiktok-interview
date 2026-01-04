# API Contract: `/api/articles` (Updated for v2)

**Purpose**: Retrieve articles with optional filtering  
**Method**: GET  
**Changes from v1**: Added query parameters for filtering

---

## GET `/api/articles`

**Description**: Retrieve articles with optional filters (date range, sources, tags)

### Request

**Query Parameters** (all optional):

| Parameter | Type | Format | Example |
|-----------|------|--------|---------|
| `dateFrom` | string | ISO 8601 date | `2024-01-01T00:00:00.000Z` |
| `dateTo` | string | ISO 8601 date | `2024-01-31T23:59:59.999Z` |
| `sources` | string | Comma-separated | `Hacker News,TechCrunch` |
| `tags` | string | Comma-separated | `AI,Web Development` |

**Example Requests**:
```
# All articles (v1 behavior, unchanged)
GET /api/articles

# Filter by date range
GET /api/articles?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T23:59:59.999Z

# Filter by sources
GET /api/articles?sources=Hacker%20News,TechCrunch

# Filter by tags
GET /api/articles?tags=AI,Security

# Combined filters
GET /api/articles?dateFrom=2024-01-01T00:00:00.000Z&sources=Hacker%20News&tags=AI
```

### Response (200 OK)

**Body (v2 - Enhanced)**:
```json
{
  "articles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "New AI Model Released",
      "description": "A breakthrough in natural language processing...",
      "content": "Full article content here...",
      "url": "https://example.com/article",
      "publishedAt": "2024-01-15T10:30:00.000Z",
      "sourceName": "Hacker News",
      "sourceUrl": "https://news.ycombinator.com/rss",
      "aiSummary": "Article discusses new transformer architecture...",
      "aiTags": ["AI", "Machine Learning", "NLP"],
      "scrapedAt": "2024-01-15T11:00:00.000Z",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "filters": {
    "dateRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "sources": ["Hacker News"],
    "tags": ["AI"]
  },
  "meta": {
    "total": 1,
    "filtered": true
  }
}
```

**TypeScript Interface**:
```typescript
interface ArticlesResponse {
  articles: Article[];
  filters?: {
    dateRange?: { from: string | null; to: string | null };
    sources?: string[];
    tags?: string[];
  };
  meta: {
    total: number;
    filtered: boolean;
  };
}

interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  publishedAt: string;  // ISO 8601
  sourceName: string;
  sourceUrl: string;
  aiSummary: string | null;
  aiTags: string[] | null;
  scrapedAt: string;  // ISO 8601
  createdAt: string;  // ISO 8601
}
```

### Error Responses

**400 Bad Request** (Invalid date format):
```json
{
  "error": "Invalid date format",
  "field": "dateFrom",
  "message": "Expected ISO 8601 format, got '2024-01-01'"
}
```

**400 Bad Request** (Invalid date range):
```json
{
  "error": "Invalid date range",
  "message": "dateFrom must be before dateTo"
}
```

---

## Implementation

### Route Handler (app/api/articles/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getFilteredArticles } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse filter parameters
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const sourcesParam = searchParams.get('sources');
  const tagsParam = searchParams.get('tags');
  
  // Validate date range
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    if (isNaN(from.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format', field: 'dateFrom' },
        { status: 400 }
      );
    }
    
    if (isNaN(to.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format', field: 'dateTo' },
        { status: 400 }
      );
    }
    
    if (from > to) {
      return NextResponse.json(
        { error: 'Invalid date range', message: 'dateFrom must be before dateTo' },
        { status: 400 }
      );
    }
  }
  
  // Parse comma-separated lists
  const sources = sourcesParam ? sourcesParam.split(',').map(s => s.trim()) : undefined;
  const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()) : undefined;
  
  // Query database with filters
  const articles = getFilteredArticles({
    dateRange: dateFrom || dateTo ? {
      from: dateFrom ? new Date(dateFrom) : null,
      to: dateTo ? new Date(dateTo) : null
    } : undefined,
    sources,
    tags
  });
  
  return NextResponse.json({
    articles,
    filters: {
      dateRange: dateFrom || dateTo ? {
        from: dateFrom,
        to: dateTo
      } : undefined,
      sources,
      tags
    },
    meta: {
      total: articles.length,
      filtered: !!(dateFrom || dateTo || sources || tags)
    }
  });
}
```

### Client-Side Usage

```typescript
// lib/api/articles.ts
export async function fetchArticles(filters?: {
  dateRange?: { from: Date | null; to: Date | null };
  sources?: string[];
  tags?: string[];
}): Promise<Article[]> {
  const params = new URLSearchParams();
  
  if (filters?.dateRange?.from) {
    params.append('dateFrom', filters.dateRange.from.toISOString());
  }
  if (filters?.dateRange?.to) {
    params.append('dateTo', filters.dateRange.to.toISOString());
  }
  if (filters?.sources && filters.sources.length > 0) {
    params.append('sources', filters.sources.join(','));
  }
  if (filters?.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }
  
  const url = `/api/articles${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data.articles;
}

// Usage in components
const articles = await fetchArticles({
  dateRange: { from: new Date('2024-01-01'), to: new Date('2024-01-31') },
  sources: ['Hacker News'],
  tags: ['AI']
});
```

---

## Backward Compatibility

✅ **Fully backward compatible with v1.0.0**:
- Calling `/api/articles` with no query parameters returns all articles (v1 behavior)
- Response structure unchanged (only added `filters` and `meta` fields)
- v1 clients ignoring new fields will continue to work

## Performance Considerations

**Query Optimization**:
- Date range filter uses existing `idx_published_at` index
- Source filter uses existing `idx_source_name` index
- Tag filter requires full table scan (acceptable for <10K articles)
- Expected response time: <100ms for 1000 articles, <500ms for 10K articles

**Caching Strategy** (Future Enhancement):
```typescript
// Add Cache-Control header for static filter combinations
export async function GET(request: NextRequest) {
  // ... filter logic ...
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```
