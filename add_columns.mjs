import postgres from 'postgres';

const DATABASE_URL = "postgresql://neondb_owner:npg_GQoXsiDSH3t1@ep-rough-haze-ab2hsjy0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(DATABASE_URL);

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to exams table...');
    
    await sql`
      ALTER TABLE exams 
      ADD COLUMN IF NOT EXISTS score_percentage INTEGER,
      ADD COLUMN IF NOT EXISTS total_questions INTEGER,
      ADD COLUMN IF NOT EXISTS correct_answers INTEGER,
      ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
    `;
    
    console.log('✓ Added columns to exams table');
    
    console.log('Adding missing columns to user_vocabulary table...');
    
    await sql`
      ALTER TABLE user_vocabulary
      ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS incorrect_count INTEGER DEFAULT 0
    `;
    
    console.log('✓ Added columns to user_vocabulary table');
    
    console.log('\nVerifying columns...');
    const columns = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('exams', 'user_vocabulary')
      ORDER BY table_name, ordinal_position
    `;
    
    console.log('\nColumns:');
    columns.forEach(col => {
      console.log(`  ${col.table_name}.${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✓ All columns added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

addMissingColumns();
