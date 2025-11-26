import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vocabulary } from './drizzle/schema';
import { sql, like, and, isNotNull } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function main() {
  console.log('🔍 Checking vocabulary table for audio data...\n');

  // Count total records with audio
  const stats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_with_audio,
      COUNT(CASE WHEN "audioKey" LIKE 'tts/nl-NL/%' THEN 1 END) as text_generated_audio,
      COUNT(CASE WHEN "audioKey" NOT LIKE 'tts/nl-NL/%' AND "audioKey" IS NOT NULL THEN 1 END) as dictionary_audio
    FROM vocabulary
    WHERE "audioUrl" IS NOT NULL
  `);

  console.log('📊 Statistics:');
  console.log('─'.repeat(50));
  console.log(`Total vocabulary entries with audio: ${stats[0].total_with_audio}`);
  console.log(`  - Text-generated audio (TTS):      ${stats[0].text_generated_audio}`);
  console.log(`  - Dictionary audio:                ${stats[0].dictionary_audio}`);
  console.log('─'.repeat(50));
  console.log('');

  // Show examples of what will be deleted
  const examples = await db.execute(sql`
    SELECT 
      id,
      "dutchWord",
      "audioKey",
      LEFT("audioUrl", 60) as audio_url_preview
    FROM vocabulary
    WHERE "audioKey" LIKE 'tts/nl-NL/%'
    LIMIT 10
  `);

  if (examples.length > 0) {
    console.log('📝 Examples of text-generated audio that will be deleted:');
    console.log('─'.repeat(80));
    examples.forEach((row: any) => {
      console.log(`ID: ${row.id} | Word: ${row.dutchWord} | Key: ${row.audioKey}`);
    });
    console.log('─'.repeat(80));
    console.log('');
  }

  // Ask for confirmation
  const shouldDelete = process.argv.includes('--confirm');

  if (!shouldDelete) {
    console.log('⚠️  To delete the text-generated audio, run:');
    console.log('   npx tsx delete-audio.ts --confirm');
    console.log('');
    await client.end();
    return;
  }

  // Delete text-generated audio
  console.log('🗑️  Deleting text-generated audio...');
  
  const result = await db.execute(sql`
    UPDATE vocabulary 
    SET "audioUrl" = NULL, "audioKey" = NULL 
    WHERE "audioKey" LIKE 'tts/nl-NL/%'
  `);

  console.log(`✅ Deleted audio from ${result.count} vocabulary entries`);
  console.log('');

  // Verify deletion
  const afterStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_with_audio,
      COUNT(CASE WHEN "audioKey" LIKE 'tts/nl-NL/%' THEN 1 END) as text_generated_audio,
      COUNT(CASE WHEN "audioKey" NOT LIKE 'tts/nl-NL/%' AND "audioKey" IS NOT NULL THEN 1 END) as dictionary_audio
    FROM vocabulary
    WHERE "audioUrl" IS NOT NULL
  `);

  console.log('📊 After deletion:');
  console.log('─'.repeat(50));
  console.log(`Total vocabulary entries with audio: ${afterStats[0].total_with_audio}`);
  console.log(`  - Text-generated audio (TTS):      ${afterStats[0].text_generated_audio}`);
  console.log(`  - Dictionary audio:                ${afterStats[0].dictionary_audio}`);
  console.log('─'.repeat(50));
  console.log('');
  console.log('✅ Done!');

  await client.end();
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
