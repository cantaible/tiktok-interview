import db from "./client";
import fs from "fs";
import path from "path";

export function initDatabase() {
  console.log("🔧 Initializing database...");

  // Read schema file
  const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema
  db.exec(schema);

  console.log("✅ Database initialized successfully");
  console.log("📍 Location:", path.join(process.cwd(), "data", "news.db"));

  // Load seed data if available
  const seedSourcesPath = path.join(process.cwd(), "data", "news-sources.json");
  const seedArticlesPath = path.join(process.cwd(), "data", "news-articles.json");

  if (fs.existsSync(seedSourcesPath)) {
    const sources = JSON.parse(fs.readFileSync(seedSourcesPath, "utf-8"));
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO sources (id, sourceType, url, displayName, enabled, lastScrapedAt, errorCount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const source of sources) {
      stmt.run(
        source.id,
        source.sourceType,
        source.url,
        source.displayName,
        source.enabled ? 1 : 0,
        source.lastScrapedAt || null,
        source.errorCount || 0
      );
    }
    console.log(`✅ Seeded ${sources.length} sources from news-sources.json`);
  }

  if (fs.existsSync(seedArticlesPath)) {
    const articles = JSON.parse(fs.readFileSync(seedArticlesPath, "utf-8"));
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO articles (id, title, sourceURL, sourceName, publishedAt, scrapedAt, summary, tags, thumbnailURL, rawContent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const article of articles) {
      stmt.run(
        article.id,
        article.title,
        article.sourceURL,
        article.sourceName,
        article.publishedAt,
        article.scrapedAt,
        article.summary || null,
        article.tags ? JSON.stringify(article.tags) : null,
        article.thumbnailURL || null,
        article.rawContent || null
      );
    }
    console.log(`✅ Seeded ${articles.length} articles from news-articles.json`);
  }

  db.close();
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}
