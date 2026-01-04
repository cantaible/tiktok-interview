import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "news.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if database file exists
const dbExists = fs.existsSync(dbPath);

// Create database connection
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Auto-initialize database on first run
if (!dbExists) {
  console.log("🔧 Database not found, initializing...");
  try {
    const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    db.exec(schema);
    
    // Load default sources
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
      console.log(`✅ Database initialized with ${sources.length} news sources`);
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export default db;
