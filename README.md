# Local News Harvester MVP

A Next.js application for collecting, filtering, and exporting news from multiple RSS feeds and web sources.

## Features

- 📰 **Manual News Collection**: Fetch news from configured RSS feeds and web pages
- 🔍 **Advanced Filtering**: Filter articles by date, source, and tags with instant search
- 🏷️ **Smart Organization**: Auto-generated summaries and tags (LLM integration ready)
- 📊 **Source Management**: Add, enable/disable, and monitor news sources
- 💾 **Data Export**: Export filtered articles in JSON or CSV formats
- 🎨 **Modern UI**: Responsive card-based interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3+
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS 3.4
- **Scraping**: rss-parser, cheerio
- **LLM**: Aliyun Bailian (optional)

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tiktok-interview
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server** (database will be auto-initialized):
   ```bash
   npm run dev
   ```
   
   The database will be automatically created on first run with default news sources.

4. **(Optional) Configure AI features**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your DASHSCOPE_API_KEY
   ```
   
   Without API key, the app works normally but AI-generated summaries and tags will not be available.

## Usage

### Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Open your browser and navigate to: **http://localhost:3000**
   - The homepage displays the news article list

3. **Basic workflow**:
   - **View Articles**: Browse articles on the homepage with filters
   - **Collect News**: Click "Collect News" button to scrape from enabled sources
   - **Filter Content**: Use date picker, source checkboxes, or tag cloud to filter
   - **Manage Sources**: Navigate to "Manage Sources" page to add/edit news sources
   - **Export Data**: Click "Export" button and choose JSON or CSV format

4. **Stop the server**:
   - Press `Ctrl+C` in the terminal

### Quick Start Guide

For first-time users:

```bash
# 1. Install dependencies
npm install

# 2. Initialize database with sample data
npm run db:seed

# 3. (Optional) Configure LLM for AI summaries
./setup-llm.sh

# 4. Start the app
npm run dev

# 5. Open browser at http://localhost:3000
```

### Production Deployment

For production use:

```bash
# Build the application
npm run build

# Start production server
npm start

# Access at http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:seed` - Initialize database with seed data
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Project Structure

```
tiktok-interview/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── articles/         # GET articles with filters
│   │   ├── scrape/           # POST scrape news sources
│   │   ├── sources/          # CRUD for news sources
│   │   └── export/           # Export articles
│   ├── sources/              # Source management page
│   ├── page.tsx              # Home page (news feed)
│   ├── layout.tsx            # Root layout
│   ├── error.tsx             # Error boundary
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── sources/              # Source management components
│   ├── FilterBar/            # Filter components
│   ├── NewsCard.tsx          # Article card display
│   ├── FilterBar.tsx         # Filter bar container
│   └── ExportButtons.tsx     # Export functionality
├── lib/                      # Business logic
│   ├── db/                   # Database layer
│   │   ├── schema.sql        # Database schema
│   │   ├── client.ts         # SQLite connection
│   │   ├── queries.ts        # Query functions
│   │   └── init.ts           # Database initialization
│   ├── scraper/              # News scraping
│   │   ├── rss-parser.ts     # RSS feed parser
│   │   ├── web-scraper.ts    # Web page scraper
│   │   └── deduplicator.ts   # Deduplication logic
│   ├── llm/                  # LLM integration
│   │   ├── bailian-client.ts # Aliyun Bailian wrapper
│   │   └── prompts.ts        # LLM prompts
│   └── export/               # Export utilities
│       ├── json-exporter.ts  # JSON export
│       └── csv-exporter.ts   # CSV export
├── types/                    # TypeScript types
│   ├── article.ts            # NewsArticle entity
│   ├── source.ts             # NewsSource entity
│   └── api.ts                # API contracts
└── data/                     # Data directory
    ├── news.db               # SQLite database (generated)
    ├── news-sources.json     # Seed data: sources
    └── news-articles.json    # Seed data: articles
```

## Database Schema

### Articles Table
- `id`: Unique identifier
- `title`: Article title
- `sourceURL`: Original article URL (unique)
- `sourceName`: Display name of source (indexed)
- `publishedAt`: Publication timestamp (indexed)
- `scrapedAt`: Scraping timestamp
- `summary`: LLM-generated summary (nullable)
- `tags`: JSON array of tags (nullable)
- `thumbnailURL`: Article image URL (nullable)
- `rawContent`: Full article text (nullable)

### Sources Table
- `id`: Unique identifier
- `sourceType`: "RSS" or "WEB"
- `url`: Feed/page URL (unique)
- `displayName`: User-friendly name
- `enabled`: Active status
- `lastScrapedAt`: Last successful scrape (nullable)
- `errorCount`: Consecutive failures

## API Endpoints

### GET /api/articles
Fetch articles with optional filters:
- `?date=YYYY-MM-DD` - Filter by date
- `?sources=source1,source2` - Filter by sources
- `?tags=tag1,tag2` - Filter by tags
- `?sort=newest|oldest` - Sort order
- `?limit=N` - Limit results
- `?path=stats` - Get statistics

### POST /api/scrape
Trigger news collection:
```json
{
  "enrichWithLLM": true
}
```

### GET /api/sources
List all news sources:
- `?enabled=true|false` - Filter by enabled status

### POST /api/sources
Add new source:
```json
{
  "sourceType": "RSS",
  "url": "https://example.com/feed.xml",
  "displayName": "Example News"
}
```

### PATCH /api/sources/:id
Update source enabled status:
```json
{
  "enabled": true
}
```

### DELETE /api/sources/:id
Delete a source

### GET /api/export
Export articles:
- `?format=json|csv` - Export format
- Accepts same filters as GET /api/articles

## Features in Detail

### News Collection
1. Fetches from enabled RSS feeds and web pages
2. Deduplicates by URL and title similarity (85% threshold)
3. Optionally enriches with LLM-generated summaries and tags
4. Saves new articles to database
5. Tracks source health (auto-disable after 3 failures)

### Filtering
- **Date**: Calendar picker to show articles from specific day
- **Sources**: Multi-select checkboxes with article counts
- **Tags**: Search and click tags in tag cloud
- **Sort**: Toggle between newest and oldest first
- **Clear**: One-click to remove all filters

### Source Management
- Add RSS feeds (auto-detects display name)
- Add web pages (manual display name)
- Enable/disable sources
- Monitor scraping status and errors
- Delete unused sources

### Data Export
- Export filtered articles to JSON or CSV
- Includes all metadata and relationships
- Filename includes export date
- CSV includes UTF-8 BOM for Excel compatibility

## Configuration

### LLM Configuration (Aliyun Bailian)

The project supports optional LLM enrichment for article summaries and tags using Aliyun Bailian API.

#### Quick Setup (Recommended)

Run the automated setup script:

```bash
./setup-llm.sh
```

The script will:
1. Prompt for your Aliyun Bailian API Key
2. Prompt for your Workspace ID
3. Create `.env.local` with proper configuration
4. Verify the configuration

#### Manual Setup

**Step 1: Obtain API Credentials**

1. Visit [Aliyun Bailian Console](https://bailian.console.aliyun.com/)
2. Create an account or log in
3. Navigate to API Management → API Keys
4. Create a new API key and copy it
5. Note your Workspace ID (found in workspace settings)

**Step 2: Configure Environment Variables**

Create `.env.local` in the project root:

```bash
# Copy from example
cp .env.local.example .env.local

# Edit and add your credentials
ALIYUN_BAILIAN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
ALIYUN_BAILIAN_WORKSPACE_ID=llm-xxxxxxxxxxxxxxxxxxxxxx
```

**Step 3: Restart Development Server**

```bash
npm run dev
```

#### Verification

When LLM is configured correctly, you'll see:
- Console log: `🤖 LLM enrichment enabled with Bailian API`
- During scraping: `🤖 Enriching 5 articles with LLM...`
- Articles will have AI-generated summaries (~100 chars) and relevant tags (2-5 tags)

#### Mock Mode vs Real API

**Mock Mode (Default)**
- **When**: No API key configured
- **Summary**: First 97 characters + "..."
- **Tags**: Extracted from article title (words as tags)
- **Cost**: Free
- **Speed**: Instant
- **Quality**: Basic

**Real API Mode**
- **When**: API key configured
- **Summary**: AI-generated, context-aware (100 chars)
- **Tags**: AI-extracted, semantically relevant (2-5 tags)
- **Cost**: ~¥0.01 per article (varies by model)
- **Speed**: 2-5 seconds per batch
- **Quality**: High

#### Troubleshooting

**LLM not activating?**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify environment variables are loaded
npm run dev
# Look for "🤖 LLM enrichment enabled" in console
```

**Invalid API key error?**
- Verify key starts with `sk-`
- Check workspace ID starts with `llm-`
- Ensure account has sufficient credits
- Test key in Aliyun console first

**Performance issues?**
- LLM enrichment adds 2-5s to scraping
- Consider scraping with `enrichWithLLM: false` for faster imports
- Enable LLM only for important sources

For detailed documentation, see:
- `LLM_FEATURE_GUIDE.md` - Complete LLM implementation details
- `LLM_SETUP_GUIDE.md` - Step-by-step setup guide with Q&A

### Other Environment Variables

Without LLM configuration:
- Summary will be first 97 characters + "..."
- Tags will be extracted from article title
- All other features work normally

### Customization

**Tailwind Colors** (`tailwind.config.ts`):
```ts
colors: {
  primary: "#3B82F6",    // Blue
  secondary: "#6B7280",  // Gray
  success: "#10B981",    // Green
  error: "#EF4444",      // Red
}
```

**Deduplication Threshold** (`lib/scraper/deduplicator.ts`):
```ts
const SIMILARITY_THRESHOLD = 0.85; // 85%
```

**LLM Prompts** (`lib/llm/prompts.ts`):
```ts
export const SUMMARY_PROMPT = "...";
export const TAGS_PROMPT = "...";
```

## Performance

- **Filter Speed**: <500ms for 500 articles (client-side with useMemo)
- **Scraping**: ~2-5s per source (network dependent)
- **Database**: SQLite with indexes on sourceName and publishedAt
- **LLM**: Batch processing for enrichment (5 articles per batch)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Author

Built for TikTok interview demonstration
