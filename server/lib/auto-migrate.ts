import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Auto-migration script that runs on app startup
 * Creates missing tables if they don't exist
 * Migrates existing tables to new schema if needed
 */
export async function autoMigrate() {
  console.log("[Auto-Migrate] Starting auto-migration...");
  
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Auto-Migrate] Database connection failed");
      return;
    }

    // Check if vocabulary table exists and has correct schema
    const vocabularyNeedsMigration = await checkVocabularySchema(db);
    
    if (vocabularyNeedsMigration) {
      console.log("[Auto-Migrate] Vocabulary table needs schema migration...");
      await migrateVocabularyTable(db);
      console.log("[Auto-Migrate] ✅ vocabulary table migrated");
    } else {
      console.log("[Auto-Migrate] ✅ vocabulary table schema is correct");
    }

    // Check if user_vocabulary table exists
    const userVocabularyExists = await checkTableExists(db, "user_vocabulary");
    
    if (!userVocabularyExists) {
      console.log("[Auto-Migrate] Creating user_vocabulary table...");
      await createUserVocabularyTable(db);
      console.log("[Auto-Migrate] ✅ user_vocabulary table created");
    } else {
      console.log("[Auto-Migrate] ✅ user_vocabulary table already exists");
    }

    console.log("[Auto-Migrate] Auto-migration completed successfully");
  } catch (error) {
    console.error("[Auto-Migrate] Error during auto-migration:", error);
    // Don't throw - allow app to start even if migration fails
  }
}

async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `);
    
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`[Auto-Migrate] Error checking table ${tableName}:`, error);
    return false;
  }
}

async function checkVocabularySchema(db: any): Promise<boolean> {
  try {
    // Check if table exists
    const tableExists = await checkTableExists(db, "vocabulary");
    
    if (!tableExists) {
      // Table doesn't exist, needs creation
      return true;
    }

    // Check if dutchWord column exists (camelCase)
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'vocabulary'
        AND column_name = 'dutchWord'
      );
    `);
    
    const hasCamelCase = result[0]?.exists || false;
    
    // If dutchWord doesn't exist, table needs migration
    return !hasCamelCase;
  } catch (error) {
    console.error("[Auto-Migrate] Error checking vocabulary schema:", error);
    return false;
  }
}

async function migrateVocabularyTable(db: any) {
  try {
    // Drop old table if exists
    console.log("[Auto-Migrate] Dropping old vocabulary table...");
    await db.execute(sql`DROP TABLE IF EXISTS "vocabulary" CASCADE;`);
    
    // Create new table with correct schema
    console.log("[Auto-Migrate] Creating vocabulary table with new schema...");
    await db.execute(sql`
      CREATE TABLE "vocabulary" (
        "id" serial PRIMARY KEY,
        "text_id" integer NOT NULL,
        "dutchWord" varchar(255) NOT NULL,
        "dutchDefinition" text,
        "wordType" varchar(50),
        "arabicTranslation" varchar(255),
        "englishTranslation" varchar(255),
        "turkishTranslation" varchar(255),
        "audioUrl" text,
        "audioKey" varchar(255),
        "exampleSentence" text,
        "difficulty" varchar(50),
        "frequency" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX "vocabulary_text_id_idx" ON "vocabulary" USING btree ("text_id");
    `);

    await db.execute(sql`
      CREATE INDEX "vocabulary_dutchWord_idx" ON "vocabulary" USING btree ("dutchWord");
    `);
    
    console.log("[Auto-Migrate] Vocabulary table created successfully");
  } catch (error) {
    console.error("[Auto-Migrate] Error migrating vocabulary table:", error);
    throw error;
  }
}

async function createUserVocabularyTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user_vocabulary" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL,
      "vocabulary_id" integer NOT NULL,
      "status" varchar(50) DEFAULT 'new' NOT NULL,
      "correct_count" integer DEFAULT 0 NOT NULL,
      "incorrect_count" integer DEFAULT 0 NOT NULL,
      "last_reviewed_at" timestamp,
      "next_review_at" timestamp DEFAULT now() NOT NULL,
      "ease_factor" integer DEFAULT 2500 NOT NULL,
      "interval" integer DEFAULT 0 NOT NULL,
      "repetitions" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Create indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "user_vocabulary_user_id_idx" ON "user_vocabulary" USING btree ("user_id");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "user_vocabulary_vocabulary_id_idx" ON "user_vocabulary" USING btree ("vocabulary_id");
  `);
}
