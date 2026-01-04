# Feature Specification: Local News Harvester MVP

**Feature Branch**: `002-ui-ux-improvements`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: 修改现在的spec，关于数据源，不能使用编造的mock数据，只能使用真实的RSS/Atom或者网页url，第二，加一个ai的button，用于刷新ai提取的相关内容，第三，根据日期筛选那里，要增加一个清空日期筛选的选项，以支持选择所有日期的新闻，第四，更新设计ui，使其更加美观"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual News Collection (Priority: P1)

A tech industry professional wants to trigger news collection from configured sources and view the results in a clean card-based interface.

**Why this priority**: This is the core value proposition - transforming scattered information into structured, readable news cards. Without this, there's no MVP.

**Independent Test**: Can be fully tested by adding RSS/web sources, triggering manual scrape, and viewing results in card layout. Delivers immediate value of consolidated news viewing.

**Acceptance Scenarios**:

1. **Given** user has added 2-3 news sources (valid RSS/Atom feeds or web URLs only - no mock data allowed), **When** user clicks "Fetch News Now" button, **Then** system scrapes sources from real URLs and displays new articles as cards within 10 seconds
2. **Given** news cards are displayed, **When** user views the card list, **Then** each card shows title, source name, publish time, one-sentence summary, 2-5 tags, and thumbnail (if available)
3. **Given** articles are fetched, **When** user clicks a card title or "Read More" link, **Then** original article opens in new browser tab
4. **Given** articles are displayed with AI-generated content, **When** user clicks global "Refresh AI Content" button in header/toolbar, **Then** system re-generates summaries and tags for ALL visible articles using LLM API with loading indicator

---

### User Story 2 - News Discovery with Filtering (Priority: P2)

A user wants to quickly find relevant news by filtering the card list by date, source, or topic tags without reading every article.

**Why this priority**: Filtering dramatically improves reading efficiency by reducing noise - a key pain point mentioned in requirements. Builds on P1's card display.

**Independent Test**: Can be tested independently by using real scraped articles from database (from v1.0.0 or fresh scraping), then applying filters to verify card list updates correctly. Delivers value even without live scraping.

**Acceptance Scenarios**:

1. **Given** 50+ news cards are displayed, **When** user selects a specific date in date picker, **Then** only cards from that date are shown, date badge appears with clear button [×], smooth transition
2. **Given** a date filter is active, **When** user clicks [×] button next to date badge, **Then** date filter is removed and all dates are shown
3. **Given** multiple sources exist (e.g., "机器之心", "量子位"), **When** user selects source checkboxes, **Then** only cards from selected sources appear, source count badge shows "N Sources" with [×] button
4. **Given** source filter is active, **When** user clicks [×] button next to source badge, **Then** all sources are re-selected (filter cleared)
5. **Given** cards have tags like "OpenAI", "NVIDIA", **When** user clicks a tag chip or types in tag search, **Then** only cards with matching tags are displayed, selected tags show as active chips with [×] icons
6. **Given** tag filter is active with multiple tags selected, **When** user clicks [×] on individual tag chip, **Then** that tag filter is removed while others remain
7. **Given** multiple filters are active (date + sources + tags), **When** user clicks "Clear All Filters" button, **Then** all filter badges/chips disappear and all cards reappear with original sort order

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
- What constitutes "mock data" vs "real data"? → Mock data = any article content not scraped from live RSS/Atom feeds or web URLs during application runtime. Pre-configured JSON files with fabricated articles (e.g., data/news-articles.json) are strictly forbidden per FR-008 and FR-031. Only articles fetched via HTTP from real sources are permitted.

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
- **FR-008**: System MUST extract structured data from REAL RSS/Atom feeds or web page scraping ONLY (no mock/fabricated data allowed): title, source name, publish date/time, article URL, summary (if extractable from feed), thumbnail image URL (if available)
- **FR-009**: System MUST implement URL-based deduplication to prevent duplicate articles
- **FR-010**: System MUST implement title similarity-based deduplication using fuzzy matching (e.g., Levenshtein distance >85% similarity threshold)
- **FR-011**: System MUST integrate Aliyun Bailian LLM API to generate one-sentence summary (max 100 chars) for each article
- **FR-012**: System MUST integrate Aliyun Bailian LLM API to generate 2-5 topic tags per article (e.g., "AI", "GPU", "Startup")
- **FR-013**: System MUST handle LLM API failures gracefully, storing articles without AI-generated fields if API unavailable
- **FR-014**: System MUST load Aliyun Bailian API key from environment variable (e.g., `.env.local` file), never hardcoded
- **FR-015**: System MUST display scraping progress indicator during fetch operation
- **FR-016**: System MUST provide global "Refresh AI Content" button in header/toolbar to regenerate summaries and tags for ALL currently displayed articles using batch processing (5 articles per batch), showing progress bar with article count (e.g., "15/47 articles") and cancel button

#### Presentation Layer (UI/UX)
- **FR-017**: System MUST display news articles in modern card-based grid layout with enhanced visual design (responsive: 1 column mobile, 2-3 columns tablet/desktop)
- **FR-018**: Each news card MUST display with polished styling: article title (clickable), source name badge, publish timestamp (relative time like "2 hours ago"), AI-generated summary, AI-generated tags as colored chips, thumbnail image (or placeholder if unavailable)
- **FR-019**: System MUST provide date picker/calendar widget to filter cards by publish date, showing active date as badge with [×] clear button when filter is applied
- **FR-020**: System MUST provide source filter as checkbox list or dropdown showing all available sources with article counts, displaying "N Sources" badge with [×] clear button when filter is active
- **FR-021**: System MUST provide tag filter with search input and tag cloud/chips showing most frequent tags, displaying selected tags as active chips with individual [×] buttons
- **FR-022**: System MUST provide prominent "Clear All Filters" button that resets ALL active filters (date, sources, tags) simultaneously and hides all filter badges
- **FR-023**: System MUST show visual feedback for active filters: colored/outlined badges for date and source filters, highlighted chips for tag filters
- **FR-024**: System MUST persist active filter state (date, sources, tags) to localStorage and automatically restore on browser refresh or next visit
- **FR-025**: System MUST provide "Reset to Default" option in FilterBar to clear all saved filter preferences and return to default view (all articles, newest first)
- **FR-026**: System MUST sort cards by publish date (newest first) as default, with visible sort toggle for oldest-first
- **FR-027**: System MUST show elegant loading skeleton/shimmer effect while fetching news or refreshing AI content
- **FR-028**: System MUST show well-designed empty state with helpful message when no articles match filters
- **FR-029**: System MUST display Toast notifications (3-second auto-dismiss) for scraping results showing success/failure statistics (e.g., "3 sources fetched, 2 failed")

#### Local Persistence & Export
- **FR-030**: System MUST pre-configure 5 real RSS sources (机器之心, 量子位, TechCrunch, The Verge, AI News) and automatically fetch 20-30 articles on first startup to ensure immediate usability
- **FR-031**: System MUST persist fetched news articles from REAL sources only (no mock data) using SQLite (primary recommendation), IndexedDB, or JSON file storage
- **FR-032**: System MUST support export to JSON format as downloadable file, including all displayed article fields
- **FR-033**: System MUST support export to CSV format with proper header row and field escaping
- **FR-034**: Export MUST respect active filters (export only visible articles, not entire database)

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
- ALL data MUST come from real RSS/Atom feeds or web scraping - NO mock/fabricated data allowed in production database
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
┌─────────────────────────────────────────────────────────┐
│ Header: [Logo] Local News Harvester                    │
│         [Fetch News] [🔄 Refresh AI Content]           │
│         Modern gradient background with glassmorphism   │
├─────────────────────────────────────────────────────────┤
│ Active Filters (shown only when filters applied):      │
│ 📅 [Jan 4, 2026] [×]  📰 [3 Sources] [×]               │
│ 🏷️ #AI [×] #GPU [×] #OpenAI [×]  [🗑️ Clear All]       │
├─────────────────────────────────────────────────────────┤
│ Filter Controls:                                        │
│ 📅 [Date Picker ▼]  📰 [Sources ▼]  🏷️ [Tags ▼]       │
│ Sort: [Newest ▼]                                        │
├─────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐│
│ │   Card         │ │   Card         │ │   Card         ││
│ │ ┌────────────┐ │ │ ┌────────────┐ │ │ ┌────────────┐ ││
│ │ │  Image     │ │ │ │  Image     │ │ │ │  Image     │ ││
│ │ └────────────┘ │ │ └────────────┘ │ │ └────────────┘ ││
│ │ Title          │ │ Title          │ │ Title          ││
│ │ [Source] 2h    │ │ [Source] 5h    │ │ [Source] 1d    ││
│ │ Summary...     │ │ Summary...     │ │ Summary...     ││
│ │ #AI #GPU       │ │ #OpenAI        │ │ #Startup       ││
│ └────────────────┘ └────────────────┘ └────────────────┘│
│                                                         │
│ Footer: [📥 Export JSON] [📊 Export CSV]                │
└─────────────────────────────────────────────────────────┘
```

**Key UI Behaviors**:
1. **Active Filter Row**: Only visible when at least one filter is applied
2. **Individual Clear [×]**: Each filter badge/chip has its own clear button
3. **Clear All Button**: Prominently placed, clears all filters at once
4. **Visual States**: 
   - Inactive filters: Default button style
   - Active filters: Colored badges with [×] buttons
   - Hover: Subtle highlight on badges and clear buttons

### Enhanced Design Tokens
- **Color Palette**: 
  - Primary: Gradient blue-purple (#3B82F6 → #6366F1) for Header and primary actions
  - Secondary: Slate gray (#64748B)
  - Success: Emerald green (#10B981)
  - Error: Rose red (#EF4444) for failed sources
  - Background: Light gray (#F8FAFC) for page background
  - Card: White (#FFFFFF) with subtle gradient border
  - Accent: Purple (#8B5CF6) for AI-related features
  - Filter badges: Color-coded (Date: Blue #3B82F6, Sources: Green #10B981, Tags: Purple #8B5CF6)

- **Typography**: 
  - System font stack: -apple-system, SF Pro, Segoe UI, Inter, Roboto
  - Headings: 20-28px, font-weight 600-700
  - Body: 15-16px, font-weight 400
  - Small text: 13-14px, font-weight 500
  - Line height: 1.6 for readability

- **Spacing**: 
  - Base unit: 4px
  - Standard scale: 8, 12, 16, 24, 32, 48, 64px
  - Card gaps: 20px on mobile, 24px on desktop

- **Card Style (Enhanced)**:
  - White background with gradient border (subtle)
  - Box shadow: 0 2px 8px rgba(0,0,0,0.08)
  - Border radius: 12px
  - Hover effect: Lift 4px + shadow increase to 0 4px 16px rgba(0,0,0,0.12)
  - Transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  - Thumbnail: 16:9 aspect ratio, object-fit cover

- **Tag Chips (Enhanced)**:
  - Rounded pill shape (border-radius: 16px)
  - Gradient backgrounds (auto-assigned per tag category)
  - White text with subtle shadow
  - Padding: 4px 12px
  - Hover effect: Scale 1.05

- **Filter Bar (Enhanced)**:
  - Glassmorphism effect (backdrop-blur)
  - Sticky position on scroll
  - Clear button with X icon
  - Animated transitions when filters change

- **Buttons**:
  - Primary: Gradient background with hover brightness
  - Secondary: Outlined with hover fill
  - Icon buttons: Circle shape with subtle background
  - All buttons: Ripple effect on click
  - "Refresh AI Content" button: Purple accent color (#8B5CF6), icon with text label, loading spinner during batch processing

### Component Priorities
1. **NewsCard** (P1): Enhanced thumbnail, title, source badge, timestamp, summary, tags
2. **Header** (P1): Logo, Fetch News button, global Refresh AI Content button
3. **FilterBar** (P2): Date picker with clear button, source multi-select, tag search
4. **SourceManager** (P3): Modern form with validation, source list with status indicators
5. **ExportButtons** (P4): Styled buttons with icons and download animation

### Accessibility & Polish
- Focus indicators: 2px outline with primary color
- Dark mode support: Consider light/dark theme toggle
- Smooth animations: Use CSS transitions and keyframes
- Loading states: Skeleton screens with shimmer effect
- Error states: Toast notifications with retry action
- Empty states: Friendly illustrations or icons

## Technical Constraints (from Constitution)

- **Spec-Driven**: This specification must be complete before any code implementation
- **AI Tooling**: Implementation must use Cursor/Claude Code/Windsurf for code generation
- **Local-First**: Application must run locally without cloud deployment (Next.js dev server or static build)
- **LLM Integration**: Must use Aliyun Bailian API (DeepSeek-V3, DeepSeek-R1, or Qwen-Max recommended)
- **Security**: API keys in `.env.local`, never committed to git (`.gitignore` enforcement)

## Clarifications

### Session 2026-01-04

- Q: When user clicks global "Refresh AI Content" button, how should batch processing work? → A: Process in batches of 5 articles, display progress bar showing "Refreshing... 15/47 articles", allow user to cancel mid-process. Cost control: ~¥0.05 per batch.

- Q: Should filter states (date, sources, tags) persist when user refreshes browser or closes tab? → A: Save filter state to localStorage and automatically restore on next visit. Provide "Reset to Default" option in FilterBar to clear saved preferences.

- Q: With "no mock data" requirement, how should first-time installation handle empty database? → A: Pre-configure 5 real RSS sources (机器之心, 量子位, TechCrunch, The Verge, AI News). On first startup, automatically fetch 20-30 real articles from these sources to ensure immediate usability.

- Q: How should UI gradient color scheme be applied across components? → A: Page background #F8FAFC (light gray), Header with blue-purple gradient (#3B82F6 → #6366F1) + glassmorphism, white cards with subtle gradient borders, primary buttons use gradient, active filter badges show color-coded (blue/green/purple).

- Q: When RSS fetch fails for 2-3 out of 5 sources, how should user be notified? → A: Display Toast notification (3s auto-dismiss) with statistics "3 sources fetched, 2 failed". Mark failed sources with red error icon + errorCount in source management page for detailed troubleshooting.

## Out of Scope (for MVP)

- Automated scraping on schedule (cron jobs)
- Full-text article content storage or reading mode
- User authentication or multi-user support
- Mobile native app (web-only MVP)
- Advanced NLP features (sentiment analysis, entity extraction)
- Social sharing or collaboration features
- Database migrations or schema versioning
- Deployment to production hosting (Vercel, AWS, etc.)
