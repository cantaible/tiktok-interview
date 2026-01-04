# Implementation Plan: Local News Harvester MVP

**Branch**: `001-news-harvester-mvp` | **Date**: 2026-01-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-news-harvester-mvp/spec.md`

## Summary

Build a local-first news aggregation web application that scrapes RSS feeds and web pages, processes articles with LLM-powered summarization/tagging via Aliyun Bailian, displays content in a filterable card-based UI, and supports JSON/CSV export. The application must run entirely on localhost without cloud deployment, demonstrating Spec-Driven Development methodology for interview assessment.

## Technical Context

**Language/Version**: TypeScript 5.3+ with Node.js 18+ (for Next.js compatibility)  
**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS 3.4, better-sqlite3, rss-parser, cheerio, @alicloud/bailian20231229 SDK  
**Storage**: SQLite (better-sqlite3 for Node.js server-side persistence)  
**Testing**: Jest + React Testing Library (unit/component tests), Playwright (E2E optional for demo)  
**Target Platform**: Web browser (Chrome/Safari/Firefox), localhost development server (Next.js dev mode)  
**Project Type**: Web application (Next.js with API routes serving as local backend)  
**Performance Goals**: <3s initial page load, <500ms client-side filter operations on 500 articles, <15s RSS scraping for 10 sources  
**Constraints**: Offline-capable after initial load, <100MB SQLite database for 1000 articles, no external deployment required  
**Scale/Scope**: Single-user local app, ~30 React components, 4 API routes, 10-15 data sources, 100-500 articles in test dataset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Spec-Driven Development (NON-NEGOTIABLE)
- ✅ **Compliance**: spec.md completed before implementation planning
- ✅ **Evidence**: All 28 functional requirements documented, 4 user stories with acceptance criteria defined
- ✅ **Next Step**: This plan.md will be completed before any code generation begins

### ✅ II. Local-First Architecture  
- ✅ **Compliance**: Next.js runs on localhost:3000, no cloud deployment
- ✅ **Storage**: SQLite database file stored in project root (./data/news.db)
- ✅ **Network**: Only outbound requests for RSS fetching and Aliyun Bailian API, no server hosting required
- ⚠️ **Clarification Needed**: NEEDS CLARIFICATION - How to handle CORS when fetching RSS from browser? (Research Phase 0)

### ✅ III. MVP Scope Discipline
- ✅ **Module 1**: Data Source Configuration (FR-001 to FR-006) ✓ In scope
- ✅ **Module 2**: Local Scraping & Processing (FR-007 to FR-015) ✓ In scope with Aliyun Bailian integration
- ✅ **Module 3**: Structured Presentation (FR-016 to FR-024) ✓ In scope
- ✅ **Module 4**: Local Storage & Export (FR-025 to FR-028) ✓ In scope
- ✅ **Out of Scope**: Automated scheduling, user auth, mobile app, deployment - all correctly excluded per spec

### 🔍 Issues Requiring Research (Phase 0)
1. **NEEDS CLARIFICATION**: RSS/web scraping architecture - Server-side (API routes) vs client-side (browser fetch with CORS proxy)?
2. **NEEDS CLARIFICATION**: Aliyun Bailian SDK integration pattern - Batch processing vs real-time streaming?
3. **NEEDS CLARIFICATION**: Deduplication algorithm - Which Levenshtein library for title similarity? Threshold tuning strategy?
4. **NEEDS CLARIFICATION**: Better-sqlite3 vs alternative SQLite libraries for Next.js compatibility

## Project Structure

### Documentation (this feature)

```text
specs/001-news-harvester-mvp/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 entity schemas
├── quickstart.md        # Phase 1 setup guide
├── contracts/           # Phase 1 API contracts
│   ├── scraping-api.yaml
│   ├── llm-api.yaml
│   └── export-api.yaml
└── checklists/
    └── requirements.md  # Spec validation (already completed)
```

### Source Code (repository root)

**Structure Decision**: Next.js Web Application (unified frontend + API routes in single project)

```text
news-harvester/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page with news grid
│   ├── sources/            # Source management page
│   │   └── page.tsx
│   └── api/                # API routes (local backend)
│       ├── scrape/
│       │   └── route.ts    # POST /api/scrape - trigger scraping
│       ├── articles/
│       │   └── route.ts    # GET /api/articles - fetch with filters
│       ├── sources/
│       │   └── route.ts    # CRUD for news sources
│       └── export/
│           └── route.ts    # GET /api/export?format=json|csv
├── components/             # React components
│   ├── NewsCard.tsx        # P1: Article card component
│   ├── FilterBar.tsx       # P2: Date/source/tag filters
│   ├── SourceManager.tsx   # P3: Source CRUD interface
│   ├── ExportButtons.tsx   # P4: JSON/CSV export
│   └── ui/                 # Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Badge.tsx
├── lib/                    # Business logic & utilities
│   ├── db/
│   │   ├── schema.ts       # SQLite schema definitions
│   │   ├── client.ts       # Database connection
│   │   └── queries.ts      # SQL query functions
│   ├── scraper/
│   │   ├── rss-parser.ts   # RSS/Atom feed parsing
│   │   ├── web-scraper.ts  # HTML scraping with cheerio
│   │   └── deduplicator.ts # URL + title similarity dedup
│   ├── llm/
│   │   ├── bailian-client.ts  # Aliyun Bailian SDK wrapper
│   │   └── prompts.ts         # Summary/tagging prompts
│   └── export/
│       ├── json-exporter.ts
│       └── csv-exporter.ts
├── types/                  # TypeScript type definitions
│   ├── article.ts          # NewsArticle entity
│   ├── source.ts           # NewsSource entity
│   └── api.ts              # API request/response types
├── public/                 # Static assets
│   └── placeholder.png     # Fallback thumbnail
├── data/                   # Local data (gitignored except examples)
│   ├── news.db             # SQLite database (runtime)
│   ├── news-sources.json   # Test data (committed)
│   └── news-articles.json  # Test data (committed)
├── __tests__/              # Jest tests
│   ├── components/
│   ├── lib/
│   └── api/
├── .env.local.example      # API key template
├── .env.local              # Actual keys (gitignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

**Rationale**: Next.js unifies frontend and backend in one project, simplifying local development. API routes run on same server as UI (localhost:3000), meeting local-first requirement. No separate backend deployment needed.

## Complexity Tracking

> **No violations to justify** - Constitution compliance achieved:
> - Single Next.js project (not multiple repos)
> - Standard web app patterns (no over-engineering)
> - SQLite for simplicity (not complex distributed DB)

*No complexity justification required.*

---

## Post-Design Constitution Re-Check

*Required after Phase 1 completion. Validates design decisions against principles.*

### ✅ I. Spec-Driven Development (NON-NEGOTIABLE)
- ✅ **Maintained**: All design artifacts (research.md, data-model.md, contracts/, quickstart.md) completed before implementation
- ✅ **Evidence**: 4 OpenAPI contract files, complete entity schemas, technology stack decisions documented
- ✅ **Ready**: Can hand off to AI code generation tools (Cursor/Claude/Windsurf) with complete specifications

### ✅ II. Local-First Architecture  
- ✅ **Validated**: Server-side scraping in Next.js API routes (no CORS issues, no external proxies)
- ✅ **Confirmed**: SQLite file persists at `./data/news.db` (no cloud database)
- ✅ **Verified**: All components run on localhost:3000, no deployment infrastructure needed
- ✅ **Resolution**: CORS concern resolved via server-side scraping (research.md decision #1)

### ✅ III. MVP Scope Discipline
- ✅ **Scope Validated**: Data model includes only 2 core entities (NewsArticle, NewsSource)
- ✅ **No Scope Creep**: All 28 FRs map to 4 API endpoints, no extras added
- ✅ **Deliverables Aligned**: Contract files match requirement.md deliverable spec (Data Models, API Interface, UI components)

**Final Gate Status**: 🟢 **ALL GATES PASSED** - Ready for Phase 2 (Task Breakdown)

---

## Implementation Readiness Summary

### ✅ Phase 0 Complete: Research & Decisions
- Technology stack finalized (TypeScript, Next.js 14, SQLite, Aliyun Bailian)
- 7 research questions answered with rationale
- Best practices established for error handling, performance, security

### ✅ Phase 1 Complete: Design & Contracts
- **Data Model**: 2 entities with complete schemas, TypeScript types, SQL DDL
- **API Contracts**: 4 OpenAPI spec files (scraping, articles, sources, export)
- **Setup Guide**: Quickstart.md with 3-minute setup instructions
- **Agent Context**: Updated GitHub Copilot instructions with tech stack

### 🎯 Ready for Phase 2: Task Breakdown
Execute `/speckit.tasks` command to generate:
- `tasks.md` - Granular implementation tasks organized by user story priority
- Estimated effort per task
- Dependency mapping for parallel execution

---

**Branch**: `001-news-harvester-mvp`  
**Artifacts Generated**:
- [plan.md](plan.md) (this file)
- [research.md](research.md)
- [data-model.md](data-model.md)
- [quickstart.md](quickstart.md)
- [contracts/scraping-api.yaml](contracts/scraping-api.yaml)
- [contracts/articles-api.yaml](contracts/articles-api.yaml)
- [contracts/sources-api.yaml](contracts/sources-api.yaml)
- [contracts/export-api.yaml](contracts/export-api.yaml)

**Status**: ✅ **Planning Phase Complete** - All NEEDS CLARIFICATION resolved, constitution gates passed  
**Next Command**: `/speckit.tasks` to break down into implementation tasks
