import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query('SELECT COUNT(*) as total, COUNT(audio_url) as with_audio FROM b1_dictionary');
console.log('Total words:', result.rows[0].total);
console.log('Words with audio:', result.rows[0].with_audio);
console.log('Coverage:', ((result.rows[0].with_audio / result.rows[0].total) * 100).toFixed(2) + '%');
await pool.end();
