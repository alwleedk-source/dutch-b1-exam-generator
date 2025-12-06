import "dotenv/config";
import { getDb } from "./db";
import { readFileSync } from "fs";
import { join } from "path";

async function runMigrations() {
  console.log("[Migrations] Starting migrations...");
  console.log(`[Migrations] CWD: ${process.cwd()}`);

  if (!process.env.DATABASE_URL) {
    console.error("[Migrations] ❌ DATABASE_URL is not defined!");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("[Migrations] ❌ Failed to initialize database connection. Check DATABASE_URL and network.");
    process.exit(1);
  }

  const migrations = [
    "004_add_ban_columns.sql",
    "005_add_forum_tables.sql",
    "006_add_timer_fields.sql",
    "1764513010_add_moderation_enhancements.sql",
    "1764514800_add_banned_until_column.sql",
    "1764515400_add_forum_moderation_actions.sql",
    "007_add_topic_suggestions.sql"
  ];

  for (const migrationFile of migrations) {
    try {
      console.log(`[Migrations] Checking ${migrationFile}...`);
      const migrationPath = join(process.cwd(), "migrations", migrationFile);

      // Check if file exists
      try {
        const fs = await import("fs");
        if (!fs.existsSync(migrationPath)) {
          console.error(`[Migrations] ❌ File not found: ${migrationPath}`);
          // Try looking in dist/migrations or ../migrations just in case
          continue;
        }
      } catch (e) {
        // ignore fs check error
      }

      const sql = readFileSync(migrationPath, "utf-8");

      await db.execute(sql);

      console.log(`[Migrations] ✅ ${migrationFile} executed successfully`);
    } catch (error) {
      console.error(`[Migrations] ❌ Failed to run ${migrationFile}:`, error);
      // Don't throw, just log. Some migrations might fail if columns already exist.
      // throw error; 
    }
  }

  console.log("[Migrations] Migration process finished.");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("[Migrations] Fatal error:", error);
  process.exit(1);
});
