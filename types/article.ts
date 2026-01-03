// NewsArticle entity type definition

export interface NewsArticle {
  id: string;
  title: string;
  sourceURL: string;
  sourceName: string;
  publishedAt: string; // ISO 8601 datetime
  scrapedAt: string; // ISO 8601 datetime
  summary: string | null;
  tags: string[] | null; // Parsed from JSON string
  thumbnailURL: string | null;
  rawContent?: string | null;
}

// Database row type (tags as JSON string)
export interface ArticleRow {
  id: string;
  title: string;
  sourceURL: string;
  sourceName: string;
  publishedAt: string;
  scrapedAt: string;
  summary: string | null;
  tags: string | null; // JSON string
  thumbnailURL: string | null;
  rawContent: string | null;
}

// Convert database row to NewsArticle
export function rowToArticle(row: ArticleRow): NewsArticle {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : null,
  };
}

// Convert NewsArticle to database row
export function articleToRow(article: NewsArticle): ArticleRow {
  return {
    id: article.id,
    title: article.title,
    sourceURL: article.sourceURL,
    sourceName: article.sourceName,
    publishedAt: article.publishedAt,
    scrapedAt: article.scrapedAt,
    summary: article.summary,
    tags: article.tags ? JSON.stringify(article.tags) : null,
    thumbnailURL: article.thumbnailURL,
    rawContent: article.rawContent || null,
  };
}

// Validation function
export function validateArticle(article: Partial<NewsArticle>): article is NewsArticle {
  return !!(
    article.id &&
    article.title &&
    article.sourceURL &&
    article.sourceName &&
    article.publishedAt &&
    article.scrapedAt
  );
}
