import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

try {
  // Check text_vocabulary links
  const links = await sql`
    SELECT * FROM text_vocabulary WHERE text_id = 56 LIMIT 5
  `;
  console.log('Text-Vocabulary links:', links.length);
  
  // Check vocabulary entries
  const vocab = await sql`
    SELECT v.* FROM vocabulary v
    INNER JOIN text_vocabulary tv ON tv.vocabulary_id = v.id
    WHERE tv.text_id = 56
    LIMIT 5
  `;
  console.log('Vocabulary entries:', vocab.length);
  if (vocab.length > 0) {
    console.log('Sample:', vocab[0]);
  }
  
  await sql.end();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
