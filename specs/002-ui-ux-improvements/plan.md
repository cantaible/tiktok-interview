# Implementation Plan: UI/UX Improvements v2

**Branch**: `002-ui-ux-improvements` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ui-ux-improvements/spec.md`

## Summary

This feature delivers v2 enhancements to the Local News Harvester MVP, focusing on four key improvements:

1. **Data Integrity**: Remove all mock data, enforce real RSS/Web sources only
2. **Global AI Refresh**: Add batch processing button to regenerate AI content for all visible articles with progress tracking
3. **Enhanced Filtering UX**: Refactor filter clearing with individual [×] buttons per filter, add localStorage persistence
4. **Modern UI Design**: Implement glassmorphism, gradient headers, color-coded filter badges, improved card animations

**Technical Approach**: Builds on v1.0.0 codebase. Refactor data initialization to remove mock articles, add batch LLM processing with cancellation support, enhance FilterBar component with granular clear actions and localStorage integration, update Tailwind config and component styles for new design system.

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 18.17+  
**Primary Dependencies**: 
- Next.js 14.2.18 (App Router, React 18)
- better-sqlite3 11.8.1 (SQLite database)
- @alicloud/bailian20231229 (LLM API client)
- Tailwind CSS 3.4.17 (styling with custom design tokens)
- rss-parser 3.13.0, cheerio 1.0.0 (scraping)
- react-hot-toast 2.4.1 (Toast notifications - NEW)

**Storage**: SQLite database (./data/news.db), localStorage for filter state (NEW)  
**Testing**: Manual testing during development, type checking with TypeScript strict mode  
**Target Platform**: Local development (npm run dev), production build (npm run build + npm start)  
**Project Type**: Web application (Next.js frontend + API routes backend)  
**Performance Goals**: 
- Filter operations <500ms for 500 articles (client-side)
- AI batch refresh: 5 articles/batch, ~2-5s per batch
- UI animations: 60fps smooth transitions

**Constraints**: 
- Must maintain backward compatibility with v1.0.0 database schema
- LLM API cost control: batch processing, cancellable operations
- localStorage limit: ~5MB for filter state
- No breaking changes to existing API routes

**Scale/Scope**: 
- Support 100-500 articles in database
- 5-20 news sources
- UI components: ~15 components, 3 enhanced (FilterBar, NewsCard, Header)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-Driven Development ✅
- Spec exists: `/specs/002-ui-ux-improvements/spec.md` (updated with clarifications)
- All features defined before implementation
- AI tools (Cursor/Claude Code) will generate code from spec

### II. Local-First Architecture ✅
- Application runs locally via `npm run dev`
- SQLite database: `./data/news.db`
- localStorage for filter state persistence
- No cloud deployment required

### III. MVP Scope Discipline ✅
- Builds on v1.0.0 MVP foundation
- Four focused improvements: data integrity, AI refresh, filter UX, UI design
- No scope creep beyond defined FR-001 to FR-034

### Technical Constraints ✅
- ✅ AI Tooling: Will use Cursor/Claude Code for implementation
- ✅ LLM API: Aliyun Bailian (@alicloud/bailian20231229) already integrated
- ✅ API Security: Keys in `.env.local`, loaded via environment variables
- ✅ Technology Stack: Next.js 14.2.18 + React 18 + TypeScript 5.3+
- ✅ Deliverables: spec.md ✓, plan.md (this file), source code (to be updated), screenshots (to be added)

**Gate Status**: ✅ PASS - All constitution principles satisfied, no violations

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-ux-improvements/
├── spec.md              # Feature specification with clarifications ✓
├── plan.md              # This file (implementation plan) ✓
├── research.md          # Phase 0: Component analysis & design decisions
├── data-model.md        # Phase 1: Updated schema & filter state structure
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Updated API contracts for batch AI refresh
└── tasks.md             # Phase 2: Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
tiktok-interview/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── articles/route.ts     # [ENHANCE] Add filter state support
│   │   ├── scrape/route.ts       # [MODIFY] Remove mock data initialization
│   │   ├── ai-refresh/           # [NEW] Batch AI refresh endpoint
│   │   │   └── route.ts
│   │   └── sources/route.ts      # [ENHANCE] Add error statistics
│   ├── page.tsx                  # [ENHANCE] Add global AI refresh button
│   ├── layout.tsx                # [ENHANCE] Update header gradient
│   └── globals.css               # [MODIFY] New design tokens
│
├── components/
│   ├── FilterBar.tsx             # [MAJOR REFACTOR] Individual clear buttons
│   ├── FilterBar/                # [NEW] Decompose into sub-components
│   │   ├── DatePicker.tsx        # [ENHANCE] Add clear button
│   │   ├── SourceFilter.tsx      # [ENHANCE] Add clear button + badge
│   │   └── TagFilter.tsx         # [ENHANCE] Individual tag clear
│   ├── NewsCard.tsx              # [ENHANCE] Updated card styles
│   ├── Header.tsx                # [NEW] Dedicated header component
│   ├── AIRefreshButton.tsx       # [NEW] Global AI refresh with progress
│   └── ui/
│       ├── Toast.tsx             # [NEW] Toast notification component
│       └── ProgressBar.tsx       # [NEW] Progress indicator
│
├── lib/
│   ├── db/
│   │   ├── init.ts               # [MODIFY] Pre-configure real RSS sources only
│   │   └── seed.ts               # [REMOVE] Delete mock article data
│   ├── llm/
│   │   └── bailian-client.ts     # [ENHANCE] Add batch processing with cancel
│   ├── hooks/
│   │   ├── useFilterState.ts     # [NEW] localStorage persistence hook
│   │   └── useAIRefresh.ts       # [NEW] Batch refresh logic hook
│   └── utils/
│       └── localStorage.ts       # [NEW] Filter state serialization
│
├── data/
│   ├── news.db                   # [SCHEMA] No changes, backward compatible
│   ├── news-sources.json         # [MODIFY] Only real RSS sources
│   └── news-articles.json        # [REMOVE] Delete mock articles file
│
├── tailwind.config.ts            # [MODIFY] Add gradient colors, glassmorphism
├── package.json                  # [ADD] react-hot-toast dependency
└── .env.local.example            # [UNCHANGED] Existing LLM config
```

**Structure Decision**: Web application structure maintained from v1.0.0. Key changes:
1. **Component decomposition**: FilterBar split into sub-components for granular control
2. **New API route**: `/api/ai-refresh` for batch processing
3. **Custom hooks**: Filter state and AI refresh logic extracted for reusability
4. **Design system**: Tailwind config updated with v2 color palette

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - Constitution Check ✅ PASS with no violations. All principles satisfied:
- Spec-Driven: v2 spec completed with clarifications
- Local-First: localStorage + SQLite, no cloud dependencies
- MVP Scope: Iterative enhancement building on v1.0.0 foundation

---

## Planning Complete: Phase 0 & 1 Deliverables

### ✅ Phase 0: Research (Completed)

**Generated**: [research.md](./research.md)

**Resolved Technical Unknowns**:
1. Filter state persistence → localStorage with JSON serialization
2. Batch AI refresh architecture → Server-side queue + client polling (5 articles/batch)
3. Toast library selection → react-hot-toast (4KB, accessible)
4. Gradient/glassmorphism implementation → Tailwind utilities + backdrop-filter
5. FilterBar decomposition → 3 sub-components (DatePicker, SourceFilter, TagFilter)
6. RSS sources pre-configuration → 5 diverse feeds (tech + research domains)

### ✅ Phase 1: Design & Contracts (Completed)

**Generated**:
- [data-model.md](./data-model.md) - SQLite schema (no changes), localStorage FilterState schema, AI refresh session state
- [contracts/api-ai-refresh.md](./contracts/api-ai-refresh.md) - POST/GET/DELETE endpoints for batch AI refresh
- [contracts/api-articles.md](./contracts/api-articles.md) - Updated GET endpoint with filter query parameters
- [quickstart.md](./quickstart.md) - Developer setup guide with 4-week implementation roadmap

**Agent Context Updated**: `.github/agents/copilot-instructions.md` updated with v2 technologies (react-hot-toast, localStorage)

---

## Next Steps: Implementation

**Ready for**: `/speckit.tasks` command to generate tasks.md with granular task breakdown

**Implementation Order** (from quickstart.md):
1. **Week 1**: Core enhancements (localStorage, FilterBar individual clear buttons, Toast integration)
2. **Week 2**: AI Refresh feature (batch endpoint, progress tracking, cancel button)
3. **Week 3**: Design system (gradient header, glassmorphism, card styling)
4. **Week 4**: Data integrity (remove mock data, pre-configure RSS sources)

**Verification**: All Phase 1 artifacts successfully generated, no NEEDS CLARIFICATION items remaining.
