# Test Data for Local News Harvester MVP

This directory contains test/mock data for developing and demonstrating the Local News Harvester application.

## Data Files

### `news-sources.json`
Contains 10 pre-configured news sources (RSS feeds and web URLs).

**Structure**:
```json
{
  "id": "source-001",
  "sourceType": "RSS" | "WEB",
  "url": "https://...",
  "displayName": "Source Name",
  "enabled": true | false,
  "lastScrapedAt": "ISO 8601 datetime",
  "errorCount": 0
}
```

**Included Sources**:
- 机器之心 (Chinese AI news)
- 量子位 (Chinese tech news)
- TechCrunch (English tech news)
- The Verge (English tech news)
- OpenAI Blog
- InfoQ中国
- 36氪快讯
- AI News
- VentureBeat (disabled for testing)
- NVIDIA Blog

### `news-articles.json`
Contains 30 mock news articles with AI-related content from 2026-01-02 to 2026-01-04.

**Structure**:
```json
{
  "id": "article-001",
  "title": "Article title",
  "sourceURL": "https://...",
  "sourceName": "Source Name",
  "publishedAt": "ISO 8601 datetime",
  "scrapedAt": "ISO 8601 datetime",
  "summary": "One-sentence summary (simulates LLM-generated)",
  "tags": ["tag1", "tag2", "tag3"],
  "thumbnailURL": "https://images.unsplash.com/...",
  "rawContent": null
}
```

**Content Coverage**:
- **Mixed Languages**: Chinese and English articles
- **Date Range**: Last 3 days (Jan 2-4, 2026)
- **Topics**: AI models, GPUs, autonomous driving, video generation, enterprise AI
- **Tags**: OpenAI, NVIDIA, 大模型, GPT-5, 自动驾驶, etc.
- **Sources**: Distributed across 10 different news sources

## Data Statistics

- **Total Articles**: 30
- **Chinese Articles**: ~17 (57%)
- **English Articles**: ~13 (43%)
- **Unique Tags**: 100+ distinct tags
- **Unique Sources**: 10 sources
- **Date Distribution**: 
  - 2026-01-04: 15 articles
  - 2026-01-03: 12 articles
  - 2026-01-02: 3 articles

## Common Tags
Most frequent tags in the dataset:
- AI, 大模型, OpenAI, 多模态, NVIDIA
- GPT-5, 视频生成, 图像生成, 自动驾驶
- 开源, 企业AI, 商用, 推理模型

## Usage

### For Frontend Development
Load these JSON files to populate the UI during development without requiring actual web scraping:

```javascript
// Example: Load mock data
const articles = await fetch('/data/news-articles.json').then(r => r.json());
const sources = await fetch('/data/news-sources.json').then(r => r.json());
```

### For Testing Filters
Use this data to test:
- **Date filter**: Articles span 3 days
- **Source filter**: 10 different sources
- **Tag filter**: 100+ unique tags
- **Search**: Chinese and English keywords
- **Sorting**: By publishedAt timestamps

### For Export Testing
Test JSON/CSV export functionality:
```bash
# All 30 articles should export successfully
# Filtered subsets should export only visible articles
```

## Data Integrity

All data follows the entity schemas defined in [specs/001-news-harvester-mvp/spec.md](../specs/001-news-harvester-mvp/spec.md):
- ✅ NewsArticle entity schema
- ✅ NewsSource entity schema
- ✅ ISO 8601 datetime format
- ✅ Valid URLs (real domains, mock paths)
- ✅ Proper UTF-8 encoding for Chinese content

## Extending Test Data

To add more articles:
1. Follow the JSON structure above
2. Use sequential IDs: `article-031`, `article-032`, etc.
3. Include both `publishedAt` (original) and `scrapedAt` (fetch time)
4. Generate 2-5 relevant tags per article
5. Keep summaries concise (max 100 chars as per spec)

## Notes

- **Thumbnail URLs**: Use Unsplash placeholder images (no copyright issues)
- **Source URLs**: Mock URLs matching real domain patterns
- **LLM Fields**: `summary` and `tags` simulate Aliyun Bailian API output
- **Error States**: `source-009` (VentureBeat) is disabled with errorCount=2 for testing error handling
- **No Raw Content**: `rawContent` is null to keep file size manageable

## Related Files

- Specification: [../specs/001-news-harvester-mvp/spec.md](../specs/001-news-harvester-mvp/spec.md)
- Constitution: [../.specify/memory/constitution.md](../.specify/memory/constitution.md)
- Requirements: [../requirement.md](../requirement.md)
