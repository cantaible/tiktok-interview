import db from "./client";
import { NewsArticle, ArticleRow, rowToArticle, articleToRow } from "@/types/article";
import { NewsSource, SourceRow, rowToSource, sourceToRow } from "@/types/source";

// Article queries

export function getArticles(filters?: {
  date?: string;
  sources?: string[];
  tags?: string[];
  sort?: "newest" | "oldest";
  limit?: number;
}): NewsArticle[] {
  let query = "SELECT * FROM articles WHERE 1=1";
  const params: any[] = [];

  if (filters?.date) {
    query += " AND date(publishedAt) = date(?)";
    params.push(filters.date);
  }

  if (filters?.sources && filters.sources.length > 0) {
    const placeholders = filters.sources.map(() => "?").join(",");
    query += ` AND sourceName IN (${placeholders})`;
    params.push(...filters.sources);
  }

  if (filters?.tags && filters.tags.length > 0) {
    // Search for tags in JSON array
    const tagConditions = filters.tags.map(() => "tags LIKE ?").join(" OR ");
    query += ` AND (${tagConditions})`;
    filters.tags.forEach((tag) => {
      params.push(`%"${tag}"%`);
    });
  }

  query += ` ORDER BY publishedAt ${filters?.sort === "oldest" ? "ASC" : "DESC"}`;

  if (filters?.limit) {
    query += " LIMIT ?";
    params.push(filters.limit);
  }

  const rows = db.prepare(query).all(...params) as ArticleRow[];
  return rows.map(rowToArticle);
}

export function getArticleById(id: string): NewsArticle | null {
  const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(id) as ArticleRow | undefined;
  return row ? rowToArticle(row) : null;
}

export function getArticleByUrl(url: string): NewsArticle | null {
  const row = db
    .prepare("SELECT * FROM articles WHERE sourceURL = ?")
    .get(url) as ArticleRow | undefined;
  return row ? rowToArticle(row) : null;
}

export function saveArticle(article: NewsArticle): void {
  const row = articleToRow(article);
  db.prepare(
    `INSERT OR REPLACE INTO articles (id, title, sourceURL, sourceName, publishedAt, scrapedAt, summary, tags, thumbnailURL, rawContent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.id,
    row.title,
    row.sourceURL,
    row.sourceName,
    row.publishedAt,
    row.scrapedAt,
    row.summary,
    row.tags,
    row.thumbnailURL,
    row.rawContent
  );
}

export function getArticleStats(): {
  totalArticles: number;
  sources: Array<{ name: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  dateRange: { earliest: string | null; latest: string | null };
} {
  const total = db.prepare("SELECT COUNT(*) as count FROM articles").get() as { count: number };

  const sources = db
    .prepare(
      "SELECT sourceName as name, COUNT(*) as count FROM articles GROUP BY sourceName ORDER BY count DESC"
    )
    .all() as Array<{ name: string; count: number }>;

  // Get all tags and count them
  const articles = getArticles();
  const tagCounts = new Map<string, number>();
  articles.forEach((article) => {
    article.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);

  const dateRange = db
    .prepare("SELECT MIN(publishedAt) as earliest, MAX(publishedAt) as latest FROM articles")
    .get() as { earliest: string | null; latest: string | null };

  return {
    totalArticles: total.count,
    sources,
    topTags,
    dateRange,
  };
}

// Source queries

export function getSources(filters?: { enabled?: boolean }): NewsSource[] {
  let query = "SELECT * FROM sources";
  const params: any[] = [];

  if (filters?.enabled !== undefined) {
    query += " WHERE enabled = ?";
    params.push(filters.enabled ? 1 : 0);
  }

  query += " ORDER BY displayName ASC";

  const rows = db.prepare(query).all(...params) as SourceRow[];
  return rows.map(rowToSource);
}

export function getSourceById(id: string): NewsSource | null {
  const row = db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as SourceRow | undefined;
  return row ? rowToSource(row) : null;
}

export function saveSource(source: NewsSource): void {
  const row = sourceToRow(source);
  db.prepare(
    `INSERT OR REPLACE INTO sources (id, sourceType, url, displayName, enabled, lastScrapedAt, errorCount)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.id,
    row.sourceType,
    row.url,
    row.displayName,
    row.enabled,
    row.lastScrapedAt,
    row.errorCount
  );
}

export function deleteSource(id: string): void {
  db.prepare("DELETE FROM sources WHERE id = ?").run(id);
}

export function updateSource(id: string, updates: Partial<NewsSource>): void {
  const source = getSourceById(id);
  if (!source) throw new Error(`Source not found: ${id}`);

  const updated = { ...source, ...updates };
  saveSource(updated);
}
