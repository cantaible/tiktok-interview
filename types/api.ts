// API request and response type definitions

import { NewsArticle } from "./article";
import { NewsSource } from "./source";

// Scraping API
export interface ScrapeRequest {
  sourceIds?: string[];
  enrichWithLLM?: boolean;
}

export interface ScrapeResponse {
  success: boolean;
  scraped: number;
  deduplicated: number;
  enriched: number;
  saved: number;
  errors: Array<{
    sourceId: string;
    sourceName: string;
    error: string;
  }>;
}

// Articles API
export interface GetArticlesRequest {
  date?: string;
  sources?: string[];
  tags?: string[];
  sort?: "newest" | "oldest";
  limit?: number;
}

export interface GetArticlesResponse {
  articles: NewsArticle[];
  total: number;
}

export interface ArticleStatsResponse {
  totalArticles: number;
  sources: Array<{
    name: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

// Sources API
export interface GetSourcesRequest {
  enabled?: boolean;
}

export interface GetSourcesResponse {
  sources: NewsSource[];
}

export interface CreateSourceRequest {
  sourceType: "RSS" | "WEB";
  url: string;
  displayName: string;
}

export interface CreateSourceResponse {
  success: boolean;
  source: NewsSource;
}

export interface UpdateSourceRequest {
  enabled: boolean;
}

export interface UpdateSourceResponse {
  success: boolean;
  source: NewsSource;
}

export interface DeleteSourceResponse {
  success: boolean;
  message: string;
}

// Export API
export interface ExportArticle {
  title: string;
  sourceURL: string;
  sourceName: string;
  publishedAt: string;
  summary: string;
  tags: string; // Comma-separated
  thumbnailURL: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}
