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

      let migrationPath = join(process.cwd(), "migrations", migrationFile);
      const fs = await import("fs");

      // Try multiple paths
      if (!fs.existsSync(migrationPath)) {
        const altPath1 = join(process.cwd(), "dist", "migrations", migrationFile);
        const altPath2 = join(process.cwd(), "..", "migrations", migrationFile);

        if (fs.existsSync(altPath1)) {
          migrationPath = altPath1;
        } else if (fs.existsSync(altPath2)) {
          migrationPath = altPath2;
        } else {
          console.error(`[Migrations] ❌ File not found in any location: ${migrationFile}`);

          // Fallback: If it's the topic suggestions migration, try to run the SQL directly
          if (migrationFile === "007_add_topic_suggestions.sql") {
            console.log("[Migrations] ⚠️ Attempting to create topic_suggestions table directly...");
            await db.execute(`
               CREATE TABLE IF NOT EXISTS "topic_suggestions" (
                 "id" serial PRIMARY KEY NOT NULL,
                 "user_id" integer NOT NULL,
                 "topic" varchar(70) NOT NULL,
                 "created_at" timestamp DEFAULT now() NOT NULL
               );
               DO $$ BEGIN
                ALTER TABLE "topic_suggestions" ADD CONSTRAINT "topic_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
               EXCEPTION
                WHEN duplicate_object THEN null;
               END $$;
             `);
            console.log("[Migrations] ✅ topic_suggestions table created directly.");
          }
          continue;
        }
      }

      console.log(`[Migrations] Found file at: ${migrationPath}`);
      const sql = readFileSync(migrationPath, "utf-8");

      await db.execute(sql);

      console.log(`[Migrations] ✅ ${migrationFile} executed successfully`);
    } catch (error) {
      console.error(`[Migrations] ❌ Failed to run ${migrationFile}:`, error);
    }
  }

  console.log("[Migrations] Migration process finished.");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("[Migrations] Fatal error:", error);
  process.exit(1);
});
