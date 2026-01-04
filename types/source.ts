// NewsSource entity type definition

export type SourceType = "RSS" | "WEB";

export interface NewsSource {
  id: string;
  sourceType: SourceType;
  url: string;
  displayName: string;
  enabled: boolean;
  lastScrapedAt: string | null; // ISO 8601 datetime
  errorCount: number;
}

// Database row type (enabled as integer)
export interface SourceRow {
  id: string;
  sourceType: SourceType;
  url: string;
  displayName: string;
  enabled: number; // 1 or 0
  lastScrapedAt: string | null;
  errorCount: number;
}

// Convert database row to NewsSource
export function rowToSource(row: SourceRow): NewsSource {
  return {
    ...row,
    enabled: row.enabled === 1,
  };
}

// Convert NewsSource to database row
export function sourceToRow(source: NewsSource): SourceRow {
  return {
    id: source.id,
    sourceType: source.sourceType,
    url: source.url,
    displayName: source.displayName,
    enabled: source.enabled ? 1 : 0,
    lastScrapedAt: source.lastScrapedAt,
    errorCount: source.errorCount,
  };
}

// Validation function
export function validateSource(source: Partial<NewsSource>): source is NewsSource {
  return !!(
    source.id &&
    source.sourceType &&
    (source.sourceType === "RSS" || source.sourceType === "WEB") &&
    source.url &&
    source.displayName &&
    typeof source.enabled === "boolean" &&
    typeof source.errorCount === "number"
  );
}
