import { Pool } from "pg";
import * as fs from "fs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importDictionary() {
  try {
    console.log("📚 Loading dictionary data...");
    const data = JSON.parse(fs.readFileSync("/home/ubuntu/b1_dictionary_complete.json", "utf8"));
    console.log(`✅ Loaded ${data.length} words`);

    console.log("🔄 Importing to database...");
    let imported = 0;
    let skipped = 0;

    for (const entry of data) {
      try {
        await pool.query(
          `INSERT INTO b1_dictionary (word, translation_ar, translation_en, translation_tr, definition_nl, frequency_rank)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (word) DO NOTHING`,
          [
            entry.word,
            entry.translation_ar,
            entry.translation_en,
            entry.translation_tr,
            entry.definition_nl,
            entry.frequency_rank || null,
          ]
        );
        imported++;
        if (imported % 100 === 0) {
          console.log(`  Progress: ${imported}/${data.length}`);
        }
      } catch (err: any) {
        console.error(`  ❌ Failed to import "${entry.word}":`, err.message);
        skipped++;
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped: ${skipped}`);

    await pool.end();
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importDictionary();
