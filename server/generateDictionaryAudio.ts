import { Pool } from "pg";
import { generateDutchSpeech } from "./lib/tts";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateDictionaryAudio() {
  try {
    console.log("🎵 Starting dictionary audio generation...");
    
    // Get all words from dictionary
    const result = await pool.query(
      `SELECT id, word FROM b1_dictionary ORDER BY frequency_rank ASC NULLS LAST`
    );
    
    const words = result.rows;
    console.log(`📚 Found ${words.length} words in dictionary`);
    
    let generated = 0;
    let skipped = 0;
    let failed = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      try {
        // Check if audio already exists
        const existing = await pool.query(
          `SELECT audio_url FROM b1_dictionary WHERE id = $1 AND audio_url IS NOT NULL`,
          [word.id]
        );
        
        if (existing.rows.length > 0) {
          skipped++;
          if (skipped % 100 === 0) {
            console.log(`  ⏭️  Skipped ${skipped} words (already have audio)`);
          }
          continue;
        }
        
        // Generate audio
        console.log(`  🎤 Generating audio for "${word.word}" (${i + 1}/${words.length})...`);
        const { audioUrl, audioKey } = await generateDutchSpeech(word.word);
        
        // Update database
        await pool.query(
          `UPDATE b1_dictionary SET audio_url = $1, audio_key = $2, updated_at = NOW() WHERE id = $3`,
          [audioUrl, audioKey, word.id]
        );
        
        generated++;
        
        if (generated % 10 === 0) {
          console.log(`  ✅ Progress: ${generated} generated, ${skipped} skipped, ${failed} failed`);
        }
        
        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`  ❌ Failed to generate audio for "${word.word}":`, error.message);
        failed++;
      }
    }
    
    console.log("\n🎉 Dictionary audio generation completed!");
    console.log(`  ✅ Generated: ${generated}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📊 Total: ${words.length}`);
    
    await pool.end();
  } catch (error) {
    console.error("❌ Audio generation failed:", error);
    process.exit(1);
  }
}

generateDictionaryAudio();
