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

  // Load real RSS sources only (no mock articles)
  const seedSourcesPath = path.join(process.cwd(), "data", "news-sources.json");

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
    console.log(`✅ Seeded ${sources.length} real RSS sources from news-sources.json`);
    console.log(`ℹ️  No mock articles loaded - use "Fetch News" button to scrape real content`);
  }

  db.close();
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}
