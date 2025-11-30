import { getDb } from "./db";
import { readFileSync } from "fs";
import { join } from "path";

async function runMigrations() {
  console.log("[Migrations] Starting migrations...");
  
  const db = await getDb();
  
  const migrations = [
    "004_add_ban_columns.sql",
    "005_add_forum_tables.sql",
    "006_add_timer_fields.sql",
    "1764513010_add_moderation_enhancements.sql"
  ];
  
  for (const migrationFile of migrations) {
    try {
      console.log(`[Migrations] Running ${migrationFile}...`);
      const migrationPath = join(process.cwd(), "migrations", migrationFile);
      const sql = readFileSync(migrationPath, "utf-8");
      
      await db.execute(sql);
      
      console.log(`[Migrations] ✅ ${migrationFile} completed successfully`);
    } catch (error) {
      console.error(`[Migrations] ❌ Failed to run ${migrationFile}:`, error);
      throw error;
    }
  }
  
  console.log("[Migrations] All migrations completed successfully!");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("[Migrations] Fatal error:", error);
  process.exit(1);
});
