import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function checkTTSCache() {
  console.log('🔍 Checking TTS cache in database...\n');
  
  // Check vocabulary table for audioUrl
  const result = await pool.query(`
    SELECT 
      id, 
      "dutchWord", 
      "audioUrl", 
      "audioKey",
      "createdAt"
    FROM vocabulary 
    WHERE "audioUrl" IS NOT NULL
    ORDER BY "createdAt" DESC
    LIMIT 10
  `);
  
  console.log(`✅ Found ${result.rows.length} words with cached audio:\n`);
  
  result.rows.forEach((row, i) => {
    console.log(`${i + 1}. ${row.dutchWord}`);
    console.log(`   audioUrl: ${row.audioUrl ? row.audioUrl.substring(0, 50) + '...' : 'NULL'}`);
    console.log(`   audioKey: ${row.audioKey || 'NULL'}`);
    console.log('');
  });
  
  // Check total vocabulary count
  const totalResult = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT("audioUrl") as with_audio
    FROM vocabulary
  `);
  
  const stats = totalResult.rows[0];
  console.log(`📊 Statistics:`);
  console.log(`   Total words: ${stats.total}`);
  console.log(`   Words with audio: ${stats.with_audio}`);
  console.log(`   Words without audio: ${stats.total - stats.with_audio}`);
  console.log(`   Cache rate: ${((stats.with_audio / stats.total) * 100).toFixed(1)}%`);
  
  await pool.end();
}

checkTTSCache().catch(console.error);
