# Tasks: Local News Harvester MVP

**Input**: Design documents from `/specs/001-news-harvester-mvp/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Tests**: Tests are NOT explicitly requested in the specification, so implementation tasks only are included below.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- File paths use Next.js structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14 project with TypeScript in repository root
- [X] T002 Install core dependencies: next@14, react@18, typescript@5.3+, tailwindcss@3.4, better-sqlite3, rss-parser, cheerio, fastest-levenshtein, @alicloud/bailian20231229, react-day-picker
- [X] T003 [P] Configure TypeScript with tsconfig.json (strict mode, path aliases)
- [X] T004 [P] Configure Tailwind CSS with tailwind.config.ts and globals.css
- [X] T005 [P] Create .env.local.example with ALIYUN_BAILIAN_API_KEY placeholder
- [X] T006 [P] Create .gitignore entries for .env.local, data/news.db, node_modules/, .next/
- [X] T007 [P] Create project folder structure: app/, components/, lib/, types/, data/, public/
- [X] T008 [P] Add placeholder.png to public/ folder (400x225px fallback thumbnail)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create SQLite database schema in lib/db/schema.sql with articles and sources tables per data-model.md
- [X] T010 Create database client in lib/db/client.ts with better-sqlite3 connection to ./data/news.db
- [X] T011 Implement database initialization script in lib/db/init.ts that creates tables and indexes
- [X] T012 [P] Create TypeScript type definitions in types/article.ts for NewsArticle entity
- [X] T013 [P] Create TypeScript type definitions in types/source.ts for NewsSource entity
- [X] T014 [P] Create TypeScript type definitions in types/api.ts for all API request/response types
- [X] T015 Implement database query functions in lib/db/queries.ts (getArticles, saveArticle, getSources, saveSource, deleteSource, updateSource)
- [X] T016 Create root layout in app/layout.tsx with metadata, font, Tailwind CSS, and basic HTML structure
- [X] T017 [P] Create shared UI components in components/ui/Button.tsx with variants (primary, secondary, outline)
- [X] T018 [P] Create shared UI components in components/ui/Input.tsx with validation states
- [X] T019 [P] Create shared UI components in components/ui/Badge.tsx for source/tag display
- [X] T020 Add npm scripts to package.json: dev, build, start, db:init, db:reset, lint, format
- [X] T021 Seed initial test data from data/news-sources.json and data/news-articles.json into database

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manual News Collection (Priority: P1) 🎯 MVP

**Goal**: Enable users to trigger news scraping from configured sources and view results as cards

**Independent Test**: Add test sources to database, click "Fetch News Now" button, verify articles display in card grid with title, source, timestamp, summary, tags, and thumbnail

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement RSS parser in lib/scraper/rss-parser.ts using rss-parser library to extract title, link, pubDate, description, image
- [X] T023 [P] [US1] Implement web scraper in lib/scraper/web-scraper.ts using cheerio to extract article metadata from HTML
- [X] T024 [P] [US1] Implement URL-based deduplicator in lib/scraper/deduplicator.ts with URL normalization and comparison
- [X] T025 [US1] Implement title similarity deduplicator in lib/scraper/deduplicator.ts using fastest-levenshtein with 85% threshold
- [X] T026 [P] [US1] Implement Aliyun Bailian client wrapper in lib/llm/bailian-client.ts with API key from env, error handling, timeout
- [X] T027 [P] [US1] Create LLM prompt templates in lib/llm/prompts.ts for summary generation (max 100 chars) and tag extraction (2-5 tags)
- [X] T028 [US1] Implement batch LLM processing function in lib/llm/bailian-client.ts with graceful degradation (store null on failure per FR-013)
- [X] T029 [US1] Create POST /api/scrape route in app/api/scrape/route.ts implementing scraping-api.yaml contract
- [X] T030 [US1] Integrate scraper, deduplicator, LLM enrichment, and database persistence in /api/scrape route handler
- [X] T031 [P] [US1] Create NewsCard component in components/NewsCard.tsx displaying title, source badge, timestamp (relative time), summary, tags as chips, thumbnail with placeholder fallback
- [X] T032 [P] [US1] Create EmptyState component in components/EmptyState.tsx for zero articles scenario per FR-024
- [X] T033 [P] [US1] Create LoadingSkeleton component in components/LoadingSkeleton.tsx with shimmer effect per FR-023
- [X] T034 [US1] Implement home page in app/page.tsx with "Fetch News Now" button, loading state, article grid (responsive 1/2/3 columns)
- [X] T035 [US1] Add client-side fetch logic in app/page.tsx to call POST /api/scrape and refresh article list
- [X] T036 [US1] Implement GET /api/articles route in app/api/articles/route.ts to return articles sorted by publishedAt DESC per articles-api.yaml
- [X] T037 [US1] Connect home page article grid to GET /api/articles endpoint with auto-refresh after scraping
- [X] T038 [US1] Add click handler to NewsCard title to open sourceURL in new tab per acceptance scenario 3

**Checkpoint**: At this point, User Story 1 should be fully functional - users can trigger scraping and view news cards

---

## Phase 4: User Story 2 - News Discovery with Filtering (Priority: P2)

**Goal**: Enable users to filter news cards by date, source, and tags to find relevant articles quickly

**Independent Test**: Load pre-populated articles into database, apply date filter to show specific day, select source checkboxes to filter by source, click tag chips to filter by topic, verify card list updates within 500ms

### Implementation for User Story 2

- [ ] T039 [P] [US2] Install and configure react-day-picker dependency for calendar widget
- [ ] T040 [P] [US2] Create DatePicker component in components/FilterBar/DatePicker.tsx with "Jump to Today" button per FR-018
- [ ] T041 [P] [US2] Create SourceFilter component in components/FilterBar/SourceFilter.tsx with checkbox list showing source names and article counts per FR-019
- [ ] T042 [P] [US2] Create TagFilter component in components/FilterBar/TagFilter.tsx with search input and tag cloud displaying most frequent tags per FR-020
- [ ] T043 [US2] Create FilterBar component in components/FilterBar.tsx integrating DatePicker, SourceFilter, TagFilter, sort toggle, and "Clear All Filters" button per FR-022
- [ ] T044 [US2] Implement client-side filtering logic in app/page.tsx to filter articles array by date, sources, tags matching FR-004 <500ms performance target
- [ ] T045 [US2] Implement sort toggle in FilterBar component switching between newest-first (DESC) and oldest-first (ASC) per FR-021
- [ ] T046 [US2] Update GET /api/articles route to support query parameters: date, sources, tags, sort, limit per articles-api.yaml contract
- [ ] T047 [US2] Add GET /api/articles/stats endpoint in app/api/articles/route.ts returning totalArticles, sources with counts, top 50 tags, date range per articles-api.yaml
- [ ] T048 [US2] Connect FilterBar components to client-side state management (useState) with URL params sync for sharable filter links
- [ ] T049 [US2] Add smooth transition animations to card grid when filters change using CSS transitions or Framer Motion
- [ ] T050 [US2] Update EmptyState component to show filter-specific messages when no articles match filters vs no articles at all

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can scrape news and filter results efficiently

---

## Phase 5: User Story 3 - News Source Management (Priority: P3)

**Goal**: Enable users to add, remove, and manage news sources (RSS and web URLs) for customization

**Independent Test**: Navigate to sources page, add new RSS feed URL, verify source appears in list, add web URL with custom name, delete source with confirmation, verify source removed from list and filters

### Implementation for User Story 3

- [ ] T051 [P] [US3] Create sources page in app/sources/page.tsx with heading and layout
- [ ] T052 [P] [US3] Create SourceForm component in components/SourceManager/SourceForm.tsx with URL input, type selector (RSS/WEB), displayName input, validation per FR-004
- [ ] T053 [P] [US3] Create SourceList component in components/SourceManager/SourceList.tsx displaying sources with name, URL, type badge, enabled status, lastScrapedAt, errorCount
- [ ] T054 [P] [US3] Create SourceListItem component in components/SourceManager/SourceListItem.tsx with delete button and enable/disable toggle
- [ ] T055 [US3] Create SourceManager component in components/SourceManager.tsx integrating SourceForm and SourceList
- [ ] T056 [US3] Implement GET /api/sources route in app/api/sources/route.ts returning all sources per sources-api.yaml
- [ ] T057 [US3] Implement POST /api/sources route in app/api/sources/route.ts to create new source with validation per sources-api.yaml
- [ ] T058 [US3] Implement DELETE /api/sources/[id]/route.ts to remove source by ID per sources-api.yaml
- [ ] T059 [US3] Implement PATCH /api/sources/[id]/route.ts to update enabled status per sources-api.yaml
- [ ] T060 [US3] Add form submission handler in SourceForm calling POST /api/sources with error display
- [ ] T061 [US3] Add delete handler in SourceListItem with confirmation dialog before calling DELETE /api/sources/[id] per FR-006
- [ ] T062 [US3] Add toggle handler in SourceListItem calling PATCH /api/sources/[id] to enable/disable source
- [ ] T063 [US3] Implement RSS feed auto-detection in POST /api/sources route to extract displayName from feed <title> per acceptance scenario 1
- [ ] T064 [US3] Add navigation link to sources page in app/layout.tsx header or home page

**Checkpoint**: All core user stories should now be functional - users can manage sources, scrape news, and filter results

---

## Phase 6: User Story 4 - Data Export for External Use (Priority: P4)

**Goal**: Enable users to export filtered news data to JSON or CSV format for analysis or archiving

**Independent Test**: Load articles into view, apply filters, click "Export as JSON" button, verify downloaded file contains only filtered articles with all fields, repeat with CSV format, verify proper escaping and header row

### Implementation for User Story 4

- [ ] T065 [P] [US4] Implement JSON exporter function in lib/export/json-exporter.ts converting articles array to JSON string
- [ ] T066 [P] [US4] Implement CSV exporter function in lib/export/csv-exporter.ts with proper field escaping, header row, and comma-separated tag handling per export-api.yaml
- [ ] T067 [US4] Create GET /api/export route in app/api/export/route.ts supporting format query param (json|csv) per export-api.yaml
- [ ] T068 [US4] Implement filter respect in GET /api/export route to export only articles matching query params (date, sources, tags) per FR-028
- [ ] T069 [US4] Add Content-Disposition header to export response for browser download with filename pattern news-export-{timestamp}.{format}
- [ ] T070 [P] [US4] Create ExportButtons component in components/ExportButtons.tsx with "Export as JSON" and "Export as CSV" buttons
- [ ] T071 [US4] Add ExportButtons to home page in app/page.tsx below FilterBar, passing current filter state to export endpoint
- [ ] T072 [US4] Add click handlers to ExportButtons triggering GET /api/export with format param and active filters
- [ ] T073 [US4] Add loading state to ExportButtons during export generation with spinner or disabled state

**Checkpoint**: All 4 user stories complete - full MVP feature set delivered

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final delivery requirements

- [ ] T074 [P] Add error boundary component in app/error.tsx for graceful error handling per FR-013 pattern
- [ ] T075 [P] Implement toast notification system for scraping success/failure, source add/delete confirmations using react-hot-toast or similar
- [ ] T076 [P] Add responsive design testing and fixes for mobile (375px), tablet (768px), desktop (1920px) per SC-007
- [ ] T077 [P] Add loading states and error messages to all API calls per FR-015 and edge cases
- [ ] T078 [P] Implement ARIA labels and keyboard navigation for accessibility per NFR requirements
- [ ] T079 [P] Add relative timestamp formatting ("2 hours ago") using date-fns library per FR-017
- [ ] T080 [P] Add title truncation with tooltip for long titles (>150 chars) per edge cases
- [ ] T081 Optimize image loading with Next.js Image component for thumbnails with placeholder blur
- [ ] T082 [P] Add warning message when user attempts to add 50+ sources per edge cases
- [ ] T083 [P] Implement auto-disable logic for sources with errorCount >= 3 per data-model.md business rules
- [ ] T084 [P] Add character encoding detection and UTF-8 conversion in scrapers per edge cases
- [ ] T085 Update README.md in repository root with project description, setup instructions from quickstart.md, and usage examples
- [ ] T086 [P] Create comprehensive .env.local.example with all environment variables and comments
- [ ] T087 Verify quickstart.md setup works end-to-end: npm install → npm run db:init → npm run dev → browser test
- [ ] T088 [P] Add TypeScript strict type checking validation: npm run type-check passes with zero errors
- [ ] T089 [P] Add ESLint configuration and fix all linting issues
- [ ] T090 Performance audit: verify <3s page load, <500ms filter operations, <15s scraping per plan.md goals

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - Integrates with US1 UI but independently testable with pre-populated data
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion - Can proceed in parallel with US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) completion - Requires US2 filter logic but minimal integration
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Recommended Sequential Order (Single Developer)

1. Complete Phase 1: Setup (Tasks T001-T008)
2. Complete Phase 2: Foundational (Tasks T009-T021) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (Tasks T022-T038) - **MVP CORE**
4. **STOP and VALIDATE**: Test scraping and card display independently
5. Complete Phase 4: User Story 2 (Tasks T039-T050) - Adds filtering
6. **STOP and VALIDATE**: Test filters with existing articles
7. Complete Phase 5: User Story 3 (Tasks T051-T064) - Adds source management
8. Complete Phase 6: User Story 4 (Tasks T065-T073) - Adds export
9. Complete Phase 7: Polish (Tasks T074-T090) - Final touches

### Parallel Opportunities (Multiple Developers or AI Tools)

**Phase 1 (Setup)**: T003, T004, T005, T006, T007, T008 can run in parallel

**Phase 2 (Foundational)**: 
- T012, T013, T014 (type definitions) can run in parallel
- T017, T018, T019 (UI components) can run in parallel after types

**Phase 3 (User Story 1)**:
- T022, T023, T024 (scrapers) can run in parallel
- T026, T027 (LLM) can run in parallel with scrapers
- T031, T032, T033 (UI components) can run in parallel
- Integration tasks (T029, T030, T034-T038) must be sequential

**Phase 4 (User Story 2)**:
- T040, T041, T042 (filter components) can run in parallel
- T046, T047 (API endpoints) can run in parallel

**Phase 5 (User Story 3)**:
- T051, T052, T053, T054 (UI components) can run in parallel
- T056, T057, T058, T059 (API routes) can run in parallel

**Phase 6 (User Story 4)**:
- T065, T066, T070 can run in parallel
- T067-T069 (API) must be sequential

**Phase 7 (Polish)**:
- T074, T075, T076, T077, T078, T079, T080, T082, T083, T084, T086, T088, T089 can run in parallel
- T087, T090 must run after all other polish tasks

---

## Parallel Execution Examples

### Example 1: Launch All User Stories After Foundational Phase

```bash
# After completing Phase 1 and Phase 2, launch in parallel:

Developer A / AI Tool 1: User Story 1 (T022-T038)
Developer B / AI Tool 2: User Story 3 (T051-T064)  # Independent of US1
Developer C / AI Tool 3: User Story 2 filter UI (T040-T043)  # Can build UI before US1 integration

# User Story 2 integration (T044-T050) requires US1 completion
# User Story 4 requires US2 filter logic
```

### Example 2: Parallel Tasks Within User Story 1

```bash
# Launch these together for User Story 1:

Task T022: "Implement RSS parser in lib/scraper/rss-parser.ts"
Task T023: "Implement web scraper in lib/scraper/web-scraper.ts"
Task T024: "Implement URL-based deduplicator in lib/scraper/deduplicator.ts"
Task T026: "Implement Aliyun Bailian client in lib/llm/bailian-client.ts"
Task T027: "Create LLM prompts in lib/llm/prompts.ts"

# Then proceed to integration tasks after all parallel tasks complete
```

### Example 3: UI Components in Parallel

```bash
# Launch all US1 UI components together:

Task T031: "Create NewsCard component in components/NewsCard.tsx"
Task T032: "Create EmptyState component in components/EmptyState.tsx"
Task T033: "Create LoadingSkeleton component in components/LoadingSkeleton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended for Demo

**Timeline**: ~8-12 hours for experienced developer

1. ✅ Complete Phase 1: Setup (~1-2 hours)
2. ✅ Complete Phase 2: Foundational (~2-3 hours) - Database, types, queries
3. ✅ Complete Phase 3: User Story 1 (~4-6 hours) - Scraping, LLM, cards
4. **STOP and VALIDATE**: 
   - Can user add test sources to database?
   - Does "Fetch News" button trigger scraping?
   - Do articles display as cards with all required fields?
   - Do cards open in new tab on click?
5. **Demo Ready**: You now have a working news aggregator MVP!

**Deliverable for Interview**: US1 demonstrates core technical skills - API integration, LLM processing, React components, database operations

### Incremental Delivery (All User Stories) - Full Spec

**Timeline**: ~20-30 hours total

1. Complete Setup + Foundational (~3-5 hours)
2. Add User Story 1 → Test independently → **Demo MVP!** (~4-6 hours)
3. Add User Story 2 → Test filters → **Demo filtering!** (~3-4 hours)
4. Add User Story 3 → Test source management → **Demo customization!** (~2-3 hours)
5. Add User Story 4 → Test export → **Demo data portability!** (~1-2 hours)
6. Polish phase → Final quality pass (~3-5 hours)

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy (If Multiple AI Tools Available)

**Hour 0-2**: All tools work on Setup + Foundational together
**Hour 2-8**: Once Foundational complete:
- Tool A: User Story 1 (scraping + cards)
- Tool B: User Story 3 (source management) - Independent
- Tool C: User Story 2 UI components (filters) - Can build in parallel
**Hour 8-12**: Integration phase:
- Connect US2 filters to US1 cards
- Add US4 export using US2 filter state
- Polish and testing

---

## Task Summary

- **Total Tasks**: 90 tasks across 7 phases
- **Setup Tasks (Phase 1)**: 8 tasks (~1-2 hours)
- **Foundational Tasks (Phase 2)**: 13 tasks (~2-3 hours, BLOCKING)
- **User Story 1 Tasks (Phase 3)**: 17 tasks (~4-6 hours, MVP CORE)
- **User Story 2 Tasks (Phase 4)**: 12 tasks (~3-4 hours)
- **User Story 3 Tasks (Phase 5)**: 14 tasks (~2-3 hours)
- **User Story 4 Tasks (Phase 6)**: 9 tasks (~1-2 hours)
- **Polish Tasks (Phase 7)**: 17 tasks (~3-5 hours)

- **Parallelizable Tasks**: 39 tasks marked with [P]
- **Sequential Tasks**: 51 tasks (require dependencies)

**Estimated Total Effort**: 20-30 developer hours for complete implementation
**MVP Effort (US1 only)**: 8-12 hours including setup and foundational work

---

## Validation Checklist

### Format Validation ✅
- [x] All 90 tasks follow `- [ ] [ID] [P?] [Story?] Description with file path` format
- [x] Task IDs sequential from T001 to T090
- [x] User story labels [US1], [US2], [US3], [US4] correctly applied to story-specific tasks
- [x] Setup and Foundational phases have NO story labels
- [x] Polish phase has NO story labels
- [x] 39 tasks correctly marked [P] for parallelizable execution
- [x] All task descriptions include specific file paths

### Content Validation ✅
- [x] All 28 functional requirements from spec.md mapped to tasks
- [x] All 4 user stories from spec.md have dedicated phases
- [x] User story priority order maintained (P1→P2→P3→P4)
- [x] All entities from data-model.md covered in foundational/implementation tasks
- [x] All 4 API contracts from contracts/ mapped to implementation tasks
- [x] Foundational phase marked as BLOCKING prerequisite
- [x] Each user story includes independent test criteria

### Dependency Validation ✅
- [x] Dependency graph shows clear phase completion order
- [x] Parallel opportunities documented with examples
- [x] MVP-first strategy documented (US1 only path)
- [x] Incremental delivery strategy documented (US1→US2→US3→US4)

---

## Notes for Implementation

- Tests are NOT included because specification does not explicitly request TDD approach
- If tests are added later, they should be written FIRST before implementation and marked [P]
- Each user story is independently testable using its "Independent Test" criteria from spec.md
- Use Cursor/Claude Code/Windsurf in Composer Mode for AI-assisted implementation
- Commit after each task or logical task group
- Validate MVP (US1) before proceeding to additional user stories
- Stop at any checkpoint to demo progress to stakeholders

**Ready for Implementation**: All specification ambiguities resolved, tasks are specific and actionable