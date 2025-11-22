import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function count() {
  const result = await pool.query('SELECT COUNT(*) FROM b1_dictionary');
  console.log('Total words in dictionary:', result.rows[0].count);
  await pool.end();
}

count();
