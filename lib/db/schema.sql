-- Local News Harvester Database Schema
-- SQLite database for article and source storage

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  sourceURL TEXT UNIQUE NOT NULL,
  sourceName TEXT NOT NULL,
  publishedAt TEXT NOT NULL,
  scrapedAt TEXT NOT NULL,
  summary TEXT,
  tags TEXT,  -- JSON array stored as string
  thumbnailURL TEXT,
  rawContent TEXT
);

CREATE INDEX IF NOT EXISTS idx_publishedAt ON articles(publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_sourceName ON articles(sourceName);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY NOT NULL,
  sourceType TEXT NOT NULL CHECK(sourceType IN ('RSS', 'WEB')),
  url TEXT UNIQUE NOT NULL,
  displayName TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  lastScrapedAt TEXT,
  errorCount INTEGER NOT NULL DEFAULT 0
);
