# Quickstart Guide: UI/UX Improvements (v2.0.0)

**Feature Branch**: `002-ui-ux-improvements`  
**Prerequisites**: Completed v1.0.0 MVP on `main` branch

---

## 1. Environment Setup

### Prerequisites Check

Verify v1.0.0 is working:
```bash
# Ensure you're on main branch with v1.0.0
git checkout main
git tag --list | grep v1.0.0  # Should show: v1.0.0

# Verify existing dependencies
node --version   # ≥18.17.0
npm --version    # ≥9.0.0
```

### Switch to Feature Branch

```bash
# Create and switch to v2 feature branch
git checkout -b 002-ui-ux-improvements

# Verify branch
git branch --show-current  # Should show: 002-ui-ux-improvements
```

---

## 2. Install New Dependencies

### Add react-hot-toast

```bash
npm install react-hot-toast@2.4.1
```

**Why**: Toast notifications for scraping feedback (FR-029)

### Verify Installation

```bash
npm list react-hot-toast
# Should output: react-hot-toast@2.4.1
```

---

## 3. Database Migration (No Schema Changes)

✅ **No migration needed** - v2 is backward compatible with v1.0.0 schema

### Verify Existing Schema

```bash
# Check database exists
ls -lh data/news.db

# Inspect tables (optional)
sqlite3 data/news.db ".schema articles"
sqlite3 data/news.db ".schema sources"
```

### Update Seed Data (Remove Mock Articles)

```bash
# Backup existing database (optional)
cp data/news.db data/news.db.v1.backup

# No automatic migration - will be handled by code changes
# Mock data removal happens in lib/db/init.ts modifications
```

---

## 4. Development Server Setup

### Start Next.js Dev Server

```bash
npm run dev
```

**Expected Output**:
```
  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000
  - ready in 2.3s
```

### Verify v1 Baseline

Before making v2 changes, test v1 functionality:

1. Open http://localhost:3000
2. Check existing features:
   - ✅ Article list loads
   - ✅ Date filter works
   - ✅ Source filter works
   - ✅ Tag filter works (if AI summaries exist)

---

## 5. Configuration Updates

### Tailwind Config (Design System)

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gradient: {
          start: '#3B82F6',  // Blue-500
          end: '#6366F1',    // Indigo-500
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
```

### Environment Variables (No Changes)

Existing `.env.local` configuration remains valid:

```bash
# Aliyun Bailian LLM API
BAILIAN_API_KEY=your_api_key_here
BAILIAN_APP_ID=your_app_id_here
```

---

## 6. Implementation Roadmap

### Phase 1: Core Enhancements (Week 1)

**Files to Create**:
```
lib/utils/localStorage.ts           # Filter state persistence
lib/hooks/useFilterState.ts         # Custom hook for filters
components/ui/Toast.tsx              # Toast wrapper (optional)
```

**Files to Modify**:
```
app/layout.tsx                       # Add Toaster component
components/FilterBar.tsx             # Add individual clear buttons
tailwind.config.ts                   # Add design tokens (done above)
```

**Testing Checklist**:
- [ ] Filter state persists after page refresh
- [ ] Individual clear buttons work (date, source, tag)
- [ ] Toast notifications appear for scraping actions

### Phase 2: AI Refresh Feature (Week 2)

**Files to Create**:
```
app/api/ai-refresh/route.ts          # Batch AI refresh endpoint
lib/hooks/useAIRefresh.ts            # Custom hook for AI refresh
components/AIRefreshButton.tsx       # Global AI refresh button
components/ui/ProgressBar.tsx        # Progress indicator
```

**Files to Modify**:
```
app/page.tsx                         # Add AIRefreshButton to header
lib/llm/bailian-client.ts            # Add batch processing + cancellation
```

**Testing Checklist**:
- [ ] AI refresh button visible in header
- [ ] Progress bar shows during batch processing
- [ ] Cancel button stops processing
- [ ] Toast shows success/error feedback

### Phase 3: Design System (Week 3)

**Files to Modify**:
```
app/layout.tsx                       # Update header with gradient
app/globals.css                      # Update CSS variables
components/NewsCard.tsx              # Enhanced card styles
components/FilterBar.tsx             # Glassmorphism effects
```

**Testing Checklist**:
- [ ] Header shows blue-indigo gradient
- [ ] Cards have updated shadows and borders
- [ ] Filter bar has glassmorphism effect
- [ ] Color-coded badges for sources/tags

### Phase 4: Data Integrity (Week 4)

**Files to Modify**:
```
lib/db/init.ts                       # Remove mock data, add real RSS sources
lib/db/seed.ts                       # Delete file (no longer needed)
data/news-sources.json               # Update with 5 real RSS sources
```

**Files to Delete**:
```
data/news-articles.json              # Delete mock articles
lib/db/seed.ts                       # Delete seed script
```

**Testing Checklist**:
- [ ] On first launch, 5 RSS sources pre-configured
- [ ] Initial scraping fetches 20-30 real articles
- [ ] No mock data in database

---

## 7. Testing Strategy

### Manual Testing Workflow

```bash
# 1. Clear localStorage (simulate first-time user)
# In browser DevTools Console:
localStorage.clear();

# 2. Refresh page - verify filters reset to defaults

# 3. Apply filters:
#    - Date: Jan 1 - Jan 31, 2024
#    - Source: Hacker News
#    - Tag: AI

# 4. Refresh page - verify filters persisted

# 5. Click individual clear buttons - verify filter removes

# 6. Click "Reset All" - verify all filters clear

# 7. Click AI Refresh button (if articles have content):
#    - Verify progress bar appears
#    - Verify cancel button works
#    - Verify toast notification on completion

# 8. Test responsive design:
#    - Resize browser window
#    - Test on mobile viewport (DevTools)
```

### Automated Tests (Optional)

```bash
# Install testing dependencies (if not already installed)
npm install -D @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

**Test Files to Create** (Phase 5, optional):
```
__tests__/lib/utils/localStorage.test.ts
__tests__/components/FilterBar.test.tsx
__tests__/hooks/useFilterState.test.ts
```

---

## 8. Development Tips

### Hot Reload Issues

If changes don't reflect:
```bash
# Stop server (Ctrl+C), then restart
npm run dev
```

### Database Inspection

```bash
# View all articles
sqlite3 data/news.db "SELECT id, title, source_name FROM articles LIMIT 10;"

# View all sources
sqlite3 data/news.db "SELECT * FROM sources;"

# Check AI-processed articles
sqlite3 data/news.db "SELECT id, title FROM articles WHERE ai_summary IS NOT NULL LIMIT 5;"
```

### Clear localStorage (Reset Filters)

```javascript
// In browser DevTools Console
localStorage.removeItem('news-harvester-filters');
```

---

## 9. Common Issues & Solutions

### Issue: Toast notifications not appearing

**Solution**:
```tsx
// Verify Toaster is added to app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />  {/* ← Must be here */}
      </body>
    </html>
  );
}
```

### Issue: Filter state not persisting

**Solution**:
```typescript
// Check browser localStorage quota (should be ~5MB available)
// In DevTools Console:
const testData = 'x'.repeat(5 * 1024 * 1024);  // 5MB string
try {
  localStorage.setItem('test', testData);
  console.log('localStorage available');
} catch (e) {
  console.error('localStorage quota exceeded');
}
localStorage.removeItem('test');
```

### Issue: AI Refresh fails with "API key invalid"

**Solution**:
```bash
# Verify .env.local has correct credentials
cat .env.local | grep BAILIAN

# Restart dev server after .env.local changes
# (Next.js doesn't hot-reload .env files)
```

---

## 10. Deployment Checklist (Post-Development)

Before merging to `main`:

- [ ] All 4 feature areas implemented (data, AI refresh, filters, design)
- [ ] Manual testing completed (see Section 7)
- [ ] No console errors in browser DevTools
- [ ] Database schema remains backward compatible
- [ ] Mock data fully removed
- [ ] Git commit messages follow convention
- [ ] Branch rebased on latest `main`

```bash
# Pre-merge commands
git add .
git commit -m "feat(v2): UI/UX improvements - filters, AI refresh, design system"
git push origin 002-ui-ux-improvements

# Create PR (GitHub)
# After review and approval:
git checkout main
git merge 002-ui-ux-improvements
git tag v2.0.0
git push origin main --tags
```

---

## Next Steps

1. **Read** `/specs/002-ui-ux-improvements/research.md` for technical decisions
2. **Review** `/specs/002-ui-ux-improvements/data-model.md` for schema details
3. **Study** `/specs/002-ui-ux-improvements/contracts/` for API contracts
4. **Start** with Phase 1 implementation (localStorage + FilterBar enhancements)

**Questions?** See `/specs/002-ui-ux-improvements/spec.md` for full requirements.
