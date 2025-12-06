import { Pool } from 'pg';

async function checkProgress() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM b1_dictionary WHERE audio_url IS NOT NULL'
  );
  
  console.log('✅ Words with audio:', result.rows[0].count, '/ 2998');
  console.log('📊 Progress:', ((result.rows[0].count / 2998) * 100).toFixed(2) + '%');
  
  await pool.end();
}

checkProgress();
