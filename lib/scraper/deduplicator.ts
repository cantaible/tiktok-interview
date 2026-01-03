import { distance } from "fastest-levenshtein";

export interface ArticleForDedup {
  sourceURL: string;
  title: string;
  sourceName: string;
  publishedAt?: string;
  description?: string;
  thumbnail?: string;
}

// URL-based deduplication
export function deduplicateByURL(articles: ArticleForDedup[]): ArticleForDedup[] {
  const seen = new Set<string>();
  const unique: ArticleForDedup[] = [];

  for (const article of articles) {
    const normalizedURL = normalizeURL(article.sourceURL);
    if (!seen.has(normalizedURL)) {
      seen.add(normalizedURL);
      unique.push(article);
    }
  }

  return unique;
}

// Title similarity-based deduplication (85% threshold)
export function deduplicateByTitle(
  articles: ArticleForDedup[],
  threshold = 0.85
): ArticleForDedup[] {
  const unique: ArticleForDedup[] = [];

  for (const article of articles) {
    let isDuplicate = false;

    for (const existingArticle of unique) {
      const similarity = calculateSimilarity(article.title, existingArticle.title);
      if (similarity >= threshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(article);
    }
  }

  return unique;
}

// Combined deduplication (URL first, then title)
export function deduplicate(articles: ArticleForDedup[]): ArticleForDedup[] {
  const afterURLDedup = deduplicateByURL(articles);
  return deduplicateByTitle(afterURLDedup);
}

// Helper: Normalize URL for comparison
function normalizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters
    const paramsToRemove = ["utm_source", "utm_medium", "utm_campaign", "ref", "source"];
    paramsToRemove.forEach((param) => parsed.searchParams.delete(param));

    // Remove trailing slashes
    const path = parsed.pathname.replace(/\/+$/, "");

    // Remove www subdomain
    const host = parsed.hostname.replace(/^www\./, "");

    return `${parsed.protocol}//${host}${path}${parsed.search}`;
  } catch {
    return url;
  }
}

// Helper: Calculate string similarity (0 to 1)
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;

  const maxLength = Math.max(str1.length, str2.length);
  const editDistance = distance(str1.toLowerCase(), str2.toLowerCase());

  return 1 - editDistance / maxLength;
}
