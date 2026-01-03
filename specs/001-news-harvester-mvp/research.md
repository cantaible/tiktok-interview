# Research: Local News Harvester MVP

**Purpose**: Resolve technical unknowns and establish best practices for implementation  
**Date**: 2026-01-04  
**Related**: [plan.md](plan.md), [spec.md](spec.md)

## Research Questions & Decisions

### 1. RSS/Web Scraping Architecture

**Question**: Should scraping run server-side (Next.js API routes) or client-side (browser with CORS proxy)?

**Decision**: **Server-side scraping in Next.js API routes**

**Rationale**:
- **CORS Bypass**: API routes run on Node.js server, can fetch any URL without browser CORS restrictions
- **Security**: API keys (Aliyun Bailian) stay server-side, never exposed to browser
- **Performance**: Node.js handles concurrent requests better than browser (10+ sources in parallel)
- **Reliability**: Server-side cheerio/rss-parser are mature, stable libraries (vs fragile browser extensions)
- **Local-First Compatible**: Next.js dev server (localhost:3000) meets "local machine" requirement

**Alternatives Considered**:
- ❌ **Browser + CORS proxy**: Adds external dependency (cors-anywhere), violates local-first principle
- ❌ **Pure client-side**: Can only fetch from CORS-enabled sources, limits news source compatibility

**Implementation Pattern**:
```typescript
// app/api/scrape/route.ts
export async function POST(request: Request) {
  const { sourceIds } = await request.json();
  const articles = await Promise.all(
    sources.map(source => 
      source.type === 'RSS' 
        ? parseRSSFeed(source.url) 
        : scrapeWebPage(source.url)
    )
  );
  return Response.json({ articles });
}
```

---

### 2. Aliyun Bailian SDK Integration Pattern

**Question**: Batch processing (scrape all → LLM all) or real-time streaming (scrape → LLM per article)?

**Decision**: **Batch processing with graceful degradation**

**Rationale**:
- **Cost Efficiency**: Single API call for 10 articles vs 10 separate calls (reduces latency)
- **Error Handling**: If LLM fails, articles still saved to DB without summary/tags (FR-013 compliance)
- **UX**: Show articles immediately, update UI when LLM results arrive (progressive enhancement)
- **Rate Limits**: Easier to implement retry logic for batches than per-article

**Alternatives Considered**:
- ❌ **Real-time per-article**: 10x more API calls, slower UX, complex error recovery
- ❌ **Synchronous blocking**: Users wait 30s+ for LLM before seeing any articles (bad UX)

**Implementation Pattern**:
```typescript
// lib/llm/bailian-client.ts
export async function enrichArticles(articles: Article[]) {
  try {
    const enriched = await bailianClient.batchInference({
      model: 'deepseek-v3',
      messages: articles.map(a => ({
        role: 'user',
        content: `Summarize in 100 chars and generate 2-5 tags:\n${a.title}\n${a.rawContent}`
      }))
    });
    return articles.map((a, i) => ({
      ...a,
      summary: enriched[i].summary,
      tags: enriched[i].tags
    }));
  } catch (error) {
    console.error('LLM enrichment failed:', error);
    return articles; // Return without AI fields (graceful degradation)
  }
}
```

---

### 3. Deduplication Algorithm & Library Choice

**Question**: Which Levenshtein library? What similarity threshold?

**Decision**: **Use `fastest-levenshtein` library with 85% similarity threshold**

**Rationale**:
- **Library Choice**: `fastest-levenshtein` is 2-3x faster than alternatives (js-levenshtein, leven), zero dependencies
- **Threshold**: 85% similarity catches near-duplicates ("OpenAI发布GPT-5" vs "OpenAI正式发布GPT-5") while avoiding false positives
- **Two-Phase Approach**:
  1. URL deduplication (exact match) - catches same article from different aggregators
  2. Title similarity (85% threshold) - catches reworded headlines

**Alternatives Considered**:
- ❌ **natural** library: 50MB+, overkill for simple similarity check
- ❌ **90% threshold**: Misses legitimate near-duplicates ("AI模型" vs "AI大模型")
- ❌ **80% threshold**: Too many false positives (different articles about same company)

**Implementation Pattern**:
```typescript
// lib/scraper/deduplicator.ts
import { distance } from 'fastest-levenshtein';

export function deduplicateArticles(articles: Article[]): Article[] {
  const seen = new Set<string>(); // URL dedup
  const titleMap = new Map<string, Article>(); // Title dedup
  
  return articles.filter(article => {
    // Phase 1: URL exact match
    if (seen.has(article.sourceURL)) return false;
    seen.add(article.sourceURL);
    
    // Phase 2: Title similarity
    for (const [existingTitle, _] of titleMap) {
      const similarity = 1 - distance(article.title, existingTitle) / Math.max(article.title.length, existingTitle.length);
      if (similarity >= 0.85) return false; // Duplicate
    }
    
    titleMap.set(article.title, article);
    return true;
  });
}
```

---

### 4. SQLite Library for Next.js

**Question**: `better-sqlite3` vs `sql.js` vs `libsql-client`?

**Decision**: **better-sqlite3 (server-side only)**

**Rationale**:
- **Performance**: Native C++ bindings, 10x faster than WASM-based `sql.js`
- **Compatibility**: Works seamlessly with Next.js API routes (Node.js runtime)
- **Simplicity**: Synchronous API, no promise wrappers needed
- **Ecosystem**: Most popular SQLite library for Node.js (14k GitHub stars)

**Tradeoff**: Cannot run in browser (client-side), but that's fine since:
- Client fetches data via API routes (`/api/articles`)
- Database operations stay server-side (aligns with local-first architecture)

**Alternatives Considered**:
- ❌ **sql.js**: WASM-based, slower, requires loading 1.5MB file to browser
- ❌ **libsql-client**: Built for Turso (cloud), unnecessary for local SQLite file

**Implementation Pattern**:
```typescript
// lib/db/client.ts
import Database from 'better-sqlite3';

const db = new Database('./data/news.db');

// Initialize schema on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sourceURL TEXT UNIQUE NOT NULL,
    sourceName TEXT NOT NULL,
    publishedAt TEXT NOT NULL,
    scrapedAt TEXT NOT NULL,
    summary TEXT,
    tags TEXT,
    thumbnailURL TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_publishedAt ON articles(publishedAt DESC);
  CREATE INDEX IF NOT EXISTS idx_sourceName ON articles(sourceName);
`);

export default db;
```

---

### 5. Next.js 14 App Router vs Pages Router

**Question**: Use new App Router or stable Pages Router?

**Decision**: **App Router (app/ directory)**

**Rationale**:
- **Modern Standard**: App Router is current Next.js recommendation (stable since v13.4)
- **Server Components**: Default server-side rendering reduces client JS bundle
- **API Routes**: Same `/api` structure in both routers, no migration issue
- **React 18**: Better suspense/streaming support for loading states

**Alternatives Considered**:
- ❌ **Pages Router**: Legacy pattern, Next.js team focuses new features on App Router

---

### 6. CSS Framework: Tailwind vs CSS Modules vs Styled Components

**Question**: Which styling approach for MVP?

**Decision**: **Tailwind CSS 3.4**

**Rationale**:
- **Speed**: Utility-first, no context switching between files
- **Responsive**: Built-in breakpoints (sm:, md:, lg:) for mobile-first design
- **Consistency**: Design tokens (colors, spacing) enforced via config
- **Bundle Size**: PurgeCSS removes unused styles, <10KB final CSS

**Alternatives Considered**:
- ❌ **CSS Modules**: More boilerplate, slower iteration
- ❌ **Styled Components**: Runtime cost, SSR complexity

---

### 7. Date Filtering Implementation

**Question**: Calendar widget library or native HTML date input?

**Decision**: **Headless UI calendar with react-day-picker**

**Rationale**:
- **UX**: Visual calendar better than `<input type="date">` for "jump to date" requirement
- **Accessibility**: Keyboard navigation, screen reader support
- **Customization**: Match design system (Tailwind tokens)

**Implementation**:
```typescript
// components/FilterBar.tsx
import { DayPicker } from 'react-day-picker';

export function FilterBar() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  return (
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
    />
  );
}
```

---

## Technology Stack Summary

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Framework** | Next.js 14 (App Router) | Unified frontend/backend, local-first compatible |
| **Language** | TypeScript 5.3 | Type safety, better IDE support for AI code generation |
| **Styling** | Tailwind CSS 3.4 | Rapid UI development, responsive utilities |
| **Database** | SQLite (better-sqlite3) | Local file, zero-config, native performance |
| **RSS Parsing** | rss-parser | Most popular RSS library (6k stars), supports Atom |
| **Web Scraping** | cheerio | jQuery-like API, fast HTML parsing |
| **LLM** | Aliyun Bailian SDK | Required by interview constraints |
| **Deduplication** | fastest-levenshtein | Fastest string similarity, zero deps |
| **Date Picker** | react-day-picker | Accessible, customizable calendar |
| **Testing** | Jest + RTL | Standard React testing stack |
| **Export** | Native JS | JSON.stringify + CSV conversion, no library needed |

---

## Best Practices Established

### 1. Error Handling Strategy
- **LLM failures**: Store articles without AI fields, show placeholder "Summary unavailable"
- **RSS/scraping failures**: Skip source, log error, continue with others
- **Database errors**: Rollback transaction, show user-friendly error toast

### 2. Performance Optimizations
- **Client-side filtering**: Filter 500 articles in <500ms using memoized selectors
- **Lazy loading**: Virtualize card list if >100 articles (react-window)
- **SQLite indexes**: Index on `publishedAt`, `sourceName` for fast queries

### 3. Security Measures
- **API keys**: Environment variables only, .env.local in .gitignore
- **SQL injection**: Use parameterized queries (better-sqlite3 automatic)
- **XSS prevention**: React escapes by default, sanitize HTML content from scraping

### 4. Development Workflow
- **Spec-first**: This research.md → data-model.md → code
- **Test data**: Use `/data/*.json` for UI development before scraping works
- **Incremental**: Implement P1 → P2 → P3 → P4 (user stories in order)

---

## Next Steps (Phase 1)

1. Generate `data-model.md` - Entity schemas with field types
2. Generate `contracts/` - API route specifications (OpenAPI format)
3. Generate `quickstart.md` - Setup instructions for running locally
4. Update agent context files with tech stack

**Status**: ✅ All NEEDS CLARIFICATION resolved  
**Ready for**: Phase 1 (Design & Contracts)
