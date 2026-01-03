# Feature Specification: Local News Harvester MVP

**Feature Branch**: `001-news-harvester-mvp`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: User description: "根据requirement.md，帮我设计合理的ui，数据源暂时不用管，我之后进行处理，对于使用的技术，use the best guess you think reasonable"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual News Collection (Priority: P1)

A tech industry professional wants to trigger news collection from configured sources and view the results in a clean card-based interface.

**Why this priority**: This is the core value proposition - transforming scattered information into structured, readable news cards. Without this, there's no MVP.

**Independent Test**: Can be fully tested by adding RSS/web sources, triggering manual scrape, and viewing results in card layout. Delivers immediate value of consolidated news viewing.

**Acceptance Scenarios**:

1. **Given** user has added 2-3 news sources (RSS/web URLs), **When** user clicks "Fetch News Now" button, **Then** system scrapes sources and displays new articles as cards within 10 seconds
2. **Given** news cards are displayed, **When** user views the card list, **Then** each card shows title, source name, publish time, one-sentence summary, 2-5 tags, and thumbnail (if available)
3. **Given** articles are fetched, **When** user clicks a card title or "Read More" link, **Then** original article opens in new browser tab

---

### User Story 2 - News Discovery with Filtering (Priority: P2)

A user wants to quickly find relevant news by filtering the card list by date, source, or topic tags without reading every article.

**Why this priority**: Filtering dramatically improves reading efficiency by reducing noise - a key pain point mentioned in requirements. Builds on P1's card display.

**Independent Test**: Can be tested independently by pre-populating mock news data, then applying filters to verify card list updates correctly. Delivers value even without live scraping.

**Acceptance Scenarios**:

1. **Given** 50+ news cards are displayed, **When** user selects a specific date in date picker, **Then** only cards from that date are shown, with smooth transition
2. **Given** multiple sources exist (e.g., "机器之心", "量子位"), **When** user selects source checkboxes, **Then** only cards from selected sources appear
3. **Given** cards have tags like "OpenAI", "NVIDIA", **When** user clicks a tag chip or types in tag search, **Then** only cards with matching tags are displayed
4. **Given** filters are applied, **When** user clicks "Clear Filters" button, **Then** all cards reappear with original sort order

---

### User Story 3 - News Source Management (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

A user wants to add, remove, and organize news sources (RSS feeds and web URLs) to customize their information intake.

**Why this priority**: Essential for personalization but can start with hardcoded sources in P1/P2. User-managed sources enable long-term product stickiness.

**Independent Test**: Can be tested independently with a simple source management form. Delivers value by allowing users to customize their news intake without requiring scraping to work.

**Acceptance Scenarios**:

1. **Given** user is on Settings/Sources page, **When** user enters valid RSS URL and clicks "Add Source", **Then** source appears in source list with auto-detected name
2. **Given** user enters plain web URL, **When** adding the source, **Then** system validates URL format and adds to list with user-provided label
3. **Given** source list contains 5+ sources, **When** user clicks delete icon on a source, **Then** confirmation dialog appears, and source is removed after confirmation

---

### User Story 4 - Data Export for External Use (Priority: P4)

A user wants to export filtered news data to JSON or CSV format for further analysis or archiving.

**Why this priority**: Nice-to-have feature for power users. MVP can function without it, but demonstrates completeness.

**Independent Test**: Can be tested with any news data loaded. Simply verify export button generates valid JSON/CSV files matching displayed cards.

**Acceptance Scenarios**:

1. **Given** news cards are displayed (filtered or unfiltered), **When** user clicks "Export as JSON" button, **Then** browser downloads JSON file with array of news objects (title, link, source, time, summary, tags)
2. **Given** same state, **When** user clicks "Export as CSV", **Then** browser downloads CSV file with properly escaped fields and header row
3. **Given** user has applied filters, **When** exporting, **Then** only visible (filtered) cards are included in export file

---

### Edge Cases

- What happens when RSS feed is unreachable or returns invalid XML? → Display error message in UI, skip that source, continue with others
- How does system handle duplicate articles from different sources with same URL? → URL-based deduplication keeps first occurrence, discards subsequent
- What if article has no publish date? → Use scrape timestamp as fallback, display "Date unavailable"
- How to handle articles with very long titles (200+ chars)? → Truncate display to 150 chars with "..." in card view, show full title in tooltip
- What if LLM API (Aliyun Bailian) fails or times out? → Display article without AI-generated summary/tags, show "Summary unavailable" placeholder
- What happens when user adds 50+ sources? → Warn user about potential performance impact, recommend 10-15 sources for optimal experience
- How to handle non-UTF8 encoded content? → Auto-detect encoding, convert to UTF-8, fallback to replacing unreadable chars with �

## Requirements *(mandatory)*

### Functional Requirements

#### Input Layer (Source Management)
- **FR-001**: System MUST allow users to add news sources via input form accepting RSS/Atom feed URLs
- **FR-002**: System MUST allow users to add plain web URLs (list pages or channel pages) as sources
- **FR-003**: System MUST support mixed Chinese and English content sources without encoding issues
- **FR-004**: System MUST validate URL format before adding to source list (basic regex check)
- **FR-005**: System MUST persist source list locally (localStorage, SQLite, or IndexedDB) across browser sessions
- **FR-006**: System MUST allow users to delete sources with confirmation prompt

#### Processing Layer (Scraping & Structuring)
- **FR-007**: System MUST provide manual "Fetch News" trigger button (no auto-scheduling required for MVP)
- **FR-008**: System MUST extract structured data from each article: title, source name, publish date/time, article URL, summary (if extractable from feed), thumbnail image URL (if available)
- **FR-009**: System MUST implement URL-based deduplication to prevent duplicate articles
- **FR-010**: System MUST implement title similarity-based deduplication using fuzzy matching (e.g., Levenshtein distance >85% similarity threshold)
- **FR-011**: System MUST integrate Aliyun Bailian LLM API to generate one-sentence summary (max 100 chars) for each article
- **FR-012**: System MUST integrate Aliyun Bailian LLM API to generate 2-5 topic tags per article (e.g., "AI", "GPU", "Startup")
- **FR-013**: System MUST handle LLM API failures gracefully, storing articles without AI-generated fields if API unavailable
- **FR-014**: System MUST load Aliyun Bailian API key from environment variable (e.g., `.env.local` file), never hardcoded
- **FR-015**: System MUST display scraping progress indicator during fetch operation

#### Presentation Layer (UI/UX)
- **FR-016**: System MUST display news articles in card-based grid layout (responsive: 1 column mobile, 2-3 columns tablet/desktop)
- **FR-017**: Each news card MUST display: article title (clickable), source name badge, publish timestamp (relative time like "2 hours ago"), AI-generated summary, AI-generated tags as colored chips, thumbnail image (or placeholder if unavailable)
- **FR-018**: System MUST provide date picker/calendar widget to filter cards by publish date, with "Jump to Today" quick action
- **FR-019**: System MUST provide source filter as checkbox list or dropdown showing all available sources with article counts
- **FR-020**: System MUST provide tag filter with search input and tag cloud/chips showing most frequent tags
- **FR-021**: System MUST sort cards by publish date (newest first) as default, with visible sort toggle for oldest-first
- **FR-022**: System MUST provide "Clear All Filters" button that resets all active filters simultaneously
- **FR-023**: System MUST show loading skeleton/shimmer effect while fetching news
- **FR-024**: System MUST show empty state with helpful message when no articles match filters

#### Local Persistence & Export
- **FR-025**: System MUST persist fetched news articles locally using SQLite (primary recommendation), IndexedDB, or JSON file storage
- **FR-026**: System MUST support export to JSON format as downloadable file, including all displayed article fields
- **FR-027**: System MUST support export to CSV format with proper header row and field escaping
- **FR-028**: Export MUST respect active filters (export only visible articles, not entire database)

### Key Entities *(include if feature involves data)*

- **NewsArticle**: Represents a single news item with attributes: unique ID, title, sourceURL (original link), sourceName, publishedAt (ISO datetime), scrapedAt (ISO datetime), summary (text or null), tags (array of strings), thumbnailURL (or null), rawContent (optional HTML/text for future full-text search)
- **NewsSource**: Represents a configured source with attributes: unique ID, sourceType (RSS or WEB), url, displayName, enabled (boolean), lastScrapedAt (ISO datetime or null), errorCount (for health monitoring)
- **UserPreferences**: Stores UI state like activeFilters (date range, selected sources, selected tags), sortOrder, lastViewedDate

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full workflow (add source → fetch news → view cards → apply filter → export) in under 5 minutes on first use
- **SC-002**: System successfully scrapes and displays news from at least 3 different RSS/web sources within 15 seconds per fetch operation
- **SC-003**: News cards display with AI-generated summaries and tags for 90%+ of articles when LLM API is available
- **SC-004**: Users can filter 100+ news articles by date/source/tag and see results update within 500ms (client-side filtering performance)
- **SC-005**: Exported JSON/CSV files contain all expected fields and are valid/parseable by standard tools (e.g., `jq` for JSON, Excel for CSV)
- **SC-006**: Application runs successfully on local machine using simple command (e.g., `npm run dev`) without external server deployment
- **SC-007**: UI is responsive and usable on mobile devices (375px width) and desktop (1920px width) without horizontal scrolling

## Assumptions *(optional)*

- Users have Node.js 18+ or Python 3.10+ installed locally for running the application
- Aliyun Bailian API trial quota is sufficient for MVP testing (~100-500 articles)
- News sources provide valid RSS/Atom feeds or scrapeable HTML (not JavaScript-rendered SPAs requiring headless browser)
- Users understand this is local-only MVP and data is not synced across devices
- Basic web scraping without complex anti-bot measures (CAPTCHA, rate limiting) is acceptable for MVP
- No user authentication required (single-user local application)

## Non-Functional Requirements *(optional)*

- **Performance**: Initial page load under 3 seconds on 4G connection; client-side filter operations under 500ms for 500 articles
- **Usability**: UI uses standard web conventions (cards, badges, chips); no tutorial needed for basic operation
- **Accessibility**: Keyboard navigable; ARIA labels on interactive elements; 4.5:1 contrast ratio for text
- **Internationalization**: UI labels support Chinese/English; mixed content sources render correctly
- **Error Handling**: All API/network errors show user-friendly messages with retry option, not console errors
- **Code Quality**: Follows Spec-Driven Development principle; spec.md documents all features before implementation

## UI Design Guidelines *(for development)*

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: [Logo] Local News Harvester    [Fetch] │
├─────────────────────────────────────────────────┤
│ Filters: [Date Picker] [Sources ▼] [Tags ▼]    │
│          [Clear Filters]  Sort: [Newest ▼]     │
├─────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │  Card   │ │  Card   │ │  Card   │  (Grid)    │
│ │ [Image] │ │ [Image] │ │ [Image] │            │
│ │ Title   │ │ Title   │ │ Title   │            │
│ │ Source  │ │ Source  │ │ Source  │            │
│ │ Tags    │ │ Tags    │ │ Tags    │            │
│ │ Summary │ │ Summary │ │ Summary │            │
│ └─────────┘ └─────────┘ └─────────┘            │
│                                                 │
│ [Export JSON] [Export CSV]                     │
└─────────────────────────────────────────────────┘
```

### Design Tokens (Recommended)
- **Color Palette**: Primary blue (#3B82F6), secondary gray (#6B7280), success green (#10B981), error red (#EF4444)
- **Typography**: System font stack (SF Pro, Segoe UI, Roboto), headings 18-24px, body 14-16px
- **Spacing**: 8px base unit (8, 16, 24, 32px for margins/padding)
- **Card Style**: White background, 1px border or subtle shadow, 8px border radius, hover effect (slight lift + shadow increase)
- **Tag Chips**: Rounded pill shape, colored backgrounds (auto-assigned per tag), white text, 6px vertical padding

### Component Priorities
1. **NewsCard** (P1): Thumbnail, title, source badge, timestamp, summary, tags
2. **FilterBar** (P2): Date picker, source multi-select, tag search
3. **SourceManager** (P3): Add/delete source form, source list with status icons
4. **ExportButtons** (P4): JSON/CSV export buttons with download icon

## Technical Constraints (from Constitution)

- **Spec-Driven**: This specification must be complete before any code implementation
- **AI Tooling**: Implementation must use Cursor/Claude Code/Windsurf for code generation
- **Local-First**: Application must run locally without cloud deployment (Next.js dev server or static build)
- **LLM Integration**: Must use Aliyun Bailian API (DeepSeek-V3, DeepSeek-R1, or Qwen-Max recommended)
- **Security**: API keys in `.env.local`, never committed to git (`.gitignore` enforcement)

## Out of Scope (for MVP)

- Automated scraping on schedule (cron jobs)
- Full-text article content storage or reading mode
- User authentication or multi-user support
- Mobile native app (web-only MVP)
- Advanced NLP features (sentiment analysis, entity extraction)
- Social sharing or collaboration features
- Database migrations or schema versioning
- Deployment to production hosting (Vercel, AWS, etc.)
