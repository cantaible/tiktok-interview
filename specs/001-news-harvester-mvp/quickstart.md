# Quickstart Guide: Local News Harvester MVP

**Purpose**: Get the application running locally in under 5 minutes  
**Date**: 2026-01-04  
**Related**: [spec.md](spec.md), [plan.md](plan.md)

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** (check with `node --version`)
- **npm 9+** or **pnpm 8+** (check with `npm --version`)
- **Aliyun Bailian API Key** (get from https://bailian.console.aliyun.com/)
- **Code editor** (VS Code recommended)

## Quick Setup (3 Minutes)

### 1. Clone & Install Dependencies

```bash
# Navigate to project root
cd /path/to/tiktok-interview

# Install dependencies
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local and add your API key
nano .env.local
```

**Required environment variables**:
```bash
# .env.local
ALIYUN_BAILIAN_API_KEY=your_api_key_here
ALIYUN_BAILIAN_ENDPOINT=https://dashscope.aliyuncs.com/api/v1
DATABASE_PATH=./data/news.db
```

### 3. Initialize Database

```bash
# Run database initialization script
npm run db:init

# Or manually run the SQL schema
node scripts/init-db.js
```

This creates `./data/news.db` with tables and seed data.

### 4. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Verification Checklist

✅ Browser shows empty news grid (no articles yet)  
✅ "Fetch News" button visible in header  
✅ Console shows no errors (open DevTools with F12)  
✅ Database file exists at `./data/news.db`

---

## First Use: Scraping News

### Option A: Use Test Data (Recommended for Quick Demo)

```bash
# Load pre-generated test data
npm run seed:articles

# Refresh browser - should see 30 test articles
```

### Option B: Scrape Live Sources

1. Click **"Fetch News"** button in header
2. Wait 10-15 seconds for scraping to complete
3. Articles appear as cards in grid layout

**Note**: Some sources may fail due to CORS/network issues. This is expected for MVP.

---

## Feature Walkthrough

### View News Cards (P1)
- Scroll through card grid
- Click article title to open in new tab
- Observe: title, source, time, summary, tags, thumbnail

### Apply Filters (P2)
1. **Date Filter**: Click calendar icon, select a date
2. **Source Filter**: Open "Sources" dropdown, check/uncheck sources
3. **Tag Filter**: Click any tag chip or search tags
4. **Clear Filters**: Click "Clear All Filters" button

### Manage Sources (P3)
1. Navigate to **Settings** page (top navigation)
2. Click **"Add Source"** button
3. Enter RSS URL or web URL
4. Provide display name
5. Click **"Save"**
6. Delete sources with trash icon (confirmation required)

### Export Data (P4)
1. Apply filters (optional)
2. Click **"Export JSON"** or **"Export CSV"** button at bottom
3. File downloads to `~/Downloads/news-export-YYYY-MM-DD.{json|csv}`

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Locked Error

```bash
# Close all Node processes
pkill -f node

# Restart dev server
npm run dev
```

### LLM API Errors (Summary/Tags Missing)

```bash
# Verify API key is set
cat .env.local | grep ALIYUN

# Check API quota
curl -H "Authorization: Bearer $ALIYUN_BAILIAN_API_KEY" \
  https://dashscope.aliyuncs.com/api/v1/models
```

**Workaround**: App works without LLM - articles show without summaries/tags.

### RSS Feed Timeout

Some feeds are slow or unreachable. This is normal. Check:
- Network connectivity
- Firewall/proxy settings
- Feed URL validity (test in browser)

Failed sources are logged in console, others continue.

---

## Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build production bundle (optional for demo)
npm run build
npm start

# Run tests (unit + integration)
npm test

# Lint code
npm run lint

# Format code
npm run format

# Clear database and reseed
npm run db:reset
```

---

## Project Structure Overview

```text
news-harvester/
├── app/                    # Next.js pages & API routes
│   ├── page.tsx            # Home (news grid)
│   ├── sources/page.tsx    # Source management
│   └── api/                # Backend endpoints
├── components/             # React UI components
├── lib/                    # Business logic
│   ├── db/                 # Database queries
│   ├── scraper/            # RSS/web scraping
│   └── llm/                # Aliyun Bailian integration
├── data/                   # Local data files
│   ├── news.db             # SQLite database
│   └── *.json              # Test data
└── .env.local              # API keys (gitignored)
```

---

## Next Steps

1. **Customize UI**: Edit Tailwind classes in `components/`
2. **Add Sources**: Configure your preferred RSS feeds in Settings
3. **Test Filtering**: Create filters with real data
4. **Export Data**: Test JSON/CSV export functionality

---

## API Endpoints (for Development)

All endpoints run on `http://localhost:3000/api`:

- `POST /api/scrape` - Trigger scraping
- `GET /api/articles?date=2026-01-04&sources=机器之心` - Fetch filtered articles
- `GET /api/sources` - List sources
- `POST /api/sources` - Add source
- `DELETE /api/sources/{id}` - Delete source
- `GET /api/export?format=json` - Export articles

See [contracts/](contracts/) for OpenAPI specifications.

---

## Getting Help

**Issues during setup?**
1. Check console for error messages (browser DevTools + terminal)
2. Verify Node.js version: `node --version` (must be 18+)
3. Ensure no other process uses port 3000: `lsof -i:3000`
4. Review `.env.local` for valid API key

**For demo/interview:**
- Use test data (`npm run seed:articles`) for guaranteed quick demo
- Live scraping may have network dependencies - have backup plan

---

**Status**: ✅ Quickstart complete  
**Expected Time**: 3-5 minutes from clone to running app  
**Next**: Proceed to tasks breakdown (`/speckit.tasks` command)
