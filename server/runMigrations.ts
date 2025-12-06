import "dotenv/config";
import { getDb } from "./db";
import { readFileSync } from "fs";
import { join } from "path";

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  skillType?: string;
  difficulty?: string;
  explanation?: string;
  evidence?: string;
}

/**
 * Shuffle answer positions in existing exams (one-time fix)
 */
async function shuffleExamAnswers(db: any) {
  console.log("[Migrations] 🔄 Checking if exam answer shuffle is needed...");

  try {
    // Check if we've already run this migration by looking at a marker
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'migrations_log' AND column_name = 'shuffle_completed'
      ) as exists
    `);

    // Create migrations_log table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS migrations_log (
        id serial PRIMARY KEY,
        migration_name varchar(255) NOT NULL UNIQUE,
        completed_at timestamp DEFAULT now()
      )
    `);

    // Check if shuffle was already done
    const shuffleCheck = await db.execute(`
      SELECT 1 FROM migrations_log WHERE migration_name = 'shuffle_exam_answers_v1'
    `);

    if (shuffleCheck.length > 0) {
      console.log("[Migrations] ✅ Exam answer shuffle already completed, skipping.");
      return;
    }

    console.log("[Migrations] 🔄 Shuffling exam answer positions...");

    // Get all exams
    const exams = await db.execute(`SELECT id, questions FROM exams WHERE questions IS NOT NULL`);

    let updatedCount = 0;

    for (const exam of exams) {
      try {
        const questions: Question[] = JSON.parse(exam.questions);

        if (!Array.isArray(questions) || questions.length === 0) continue;

        // Shuffle each question's options
        const shuffledQuestions = questions.map((q) => {
          if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
            return q;
          }

          // Get the correct answer before shuffling
          const correctAnswer = q.options[q.correctAnswerIndex];

          // Fisher-Yates shuffle
          const shuffled = [...q.options];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          // Find where the correct answer ended up
          const newCorrectIndex = shuffled.indexOf(correctAnswer);

          return {
            ...q,
            options: shuffled,
            correctAnswerIndex: newCorrectIndex,
          };
        });

        // Update the exam
        const escapedQuestions = JSON.stringify(shuffledQuestions).replace(/'/g, "''");
        await db.execute(`UPDATE exams SET questions = '${escapedQuestions}' WHERE id = ${exam.id}`);
        updatedCount++;

      } catch (error) {
        console.error(`[Migrations] ⚠️ Error processing exam ${exam.id}:`, error);
      }
    }

    // Mark migration as complete
    await db.execute(`
      INSERT INTO migrations_log (migration_name) VALUES ('shuffle_exam_answers_v1')
    `);

    console.log(`[Migrations] ✅ Shuffled ${updatedCount} exams successfully!`);

  } catch (error) {
    console.error("[Migrations] ❌ Error in shuffle migration:", error);
    // Don't fail the entire migration process
  }
}

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
    "007_add_topic_suggestions.sql",
    "008_add_foreign_keys.sql"
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

  // Run the exam answer shuffle (one-time migration)
  await shuffleExamAnswers(db);

  console.log("[Migrations] Migration process finished.");
  process.exit(0);
}

runMigrations().catch((error) => {
  console.error("[Migrations] Fatal error:", error);
  process.exit(1);
});

