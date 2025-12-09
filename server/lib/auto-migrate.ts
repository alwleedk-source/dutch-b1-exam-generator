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

    // Check if b1_dictionary table exists
    const b1DictionaryExists = await checkTableExists(db, "b1_dictionary");

    if (!b1DictionaryExists) {
      console.log("[Auto-Migrate] Creating b1_dictionary table...");
      await createB1DictionaryTable(db);
      console.log("[Auto-Migrate] ✅ b1_dictionary table created");

      // Import dictionary data
      console.log("[Auto-Migrate] Importing dictionary data...");
      await importDictionaryData(db);
      console.log("[Auto-Migrate] ✅ dictionary data imported");
    } else {
      console.log("[Auto-Migrate] ✅ b1_dictionary table already exists");

      // Add audio columns if they don't exist (migration for existing tables)
      console.log("[Auto-Migrate] Checking for audio columns...");
      await db.execute(sql`
        ALTER TABLE "b1_dictionary" 
        ADD COLUMN IF NOT EXISTS "audio_url" text,
        ADD COLUMN IF NOT EXISTS "audio_key" varchar(255);
      `);
      console.log("[Auto-Migrate] ✅ audio columns ensured");

      // Check if table is empty
      const count = await db.execute(sql`SELECT COUNT(*) as count FROM b1_dictionary`);
      const wordCount = parseInt(count[0]?.count || '0');

      if (wordCount === 0) {
        console.log("[Auto-Migrate] Dictionary table is empty, importing data...");
        await importDictionaryData(db);
        console.log("[Auto-Migrate] ✅ dictionary data imported");
      } else {
        console.log(`[Auto-Migrate] ✅ dictionary has ${wordCount} words`);
      }
    }

    // Add missing columns to users table (self-healing for has_seen_onboarding and ban fields)
    console.log("[Auto-Migrate] Ensuring users table has all required columns...");
    try {
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "has_seen_onboarding" boolean DEFAULT false NOT NULL;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "is_banned" boolean DEFAULT false NOT NULL;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "banned_at" timestamp;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "banned_until" timestamp;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "banned_by" integer;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "ban_reason" text;
      `);
      // Gamification fields
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "total_points" integer DEFAULT 0 NOT NULL;
      `);
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "current_level" varchar(50) DEFAULT 'beginner' NOT NULL;
      `);
      console.log("[Auto-Migrate] ✅ users table columns ensured");
    } catch (error) {
      console.error("[Auto-Migrate] Error adding users columns:", error);
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


async function createB1DictionaryTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "b1_dictionary" (
      "id" serial PRIMARY KEY,
      "word" varchar(255) NOT NULL UNIQUE,
      "translation_ar" text,
      "translation_en" text,
      "translation_tr" text,
      "definition_nl" text,
      "example_nl" text,
      "word_type" varchar(50),
      "frequency_rank" integer,
      "audio_url" text,
      "audio_key" varchar(255),
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // Add audio columns if table already exists (migration)
  await db.execute(sql`
    ALTER TABLE "b1_dictionary" 
    ADD COLUMN IF NOT EXISTS "audio_url" text,
    ADD COLUMN IF NOT EXISTS "audio_key" varchar(255);
  `);

  // Create indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "b1_dictionary_word_idx" ON "b1_dictionary" USING btree ("word");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "b1_dictionary_frequency_rank_idx" ON "b1_dictionary" USING btree ("frequency_rank");
  `);
}


async function importDictionaryData(db: any) {
  try {
    // Import fs module
    const fs = await import('fs');
    const path = await import('path');

    // Load dictionary data from JSON file
    const dictionaryPath = path.join(process.cwd(), 'data', 'b1_dictionary.json');

    if (!fs.existsSync(dictionaryPath)) {
      console.error(`[Auto-Migrate] Dictionary file not found at ${dictionaryPath}`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
    console.log(`[Auto-Migrate] Loaded ${data.length} words from dictionary`);

    // Import in batches
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      for (const entry of batch) {
        try {
          await db.execute(sql`
            INSERT INTO b1_dictionary (word, translation_ar, translation_en, translation_tr, definition_nl, frequency_rank)
            VALUES (${entry.word}, ${entry.translation_ar || null}, ${entry.translation_en || null}, ${entry.translation_tr || null}, ${entry.definition_nl || null}, ${entry.frequency_rank || null})
            ON CONFLICT (word) DO NOTHING
          `);
          imported++;
        } catch (err) {
          console.error(`[Auto-Migrate] Failed to import "${entry.word}":`, err);
        }
      }

      console.log(`[Auto-Migrate] Progress: ${imported}/${data.length}`);
    }

    console.log(`[Auto-Migrate] Successfully imported ${imported} words`);
  } catch (error) {
    console.error("[Auto-Migrate] Error importing dictionary data:", error);
    throw error;
  }
}
