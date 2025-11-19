import postgres from 'postgres';

const DATABASE_URL = "postgresql://neondb_owner:npg_GQoXsiDSH3t1@ep-rough-haze-ab2hsjy0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(DATABASE_URL);

async function addMissingColumns() {
  try {
    console.log('Adding SRS columns to user_vocabulary table...');
    
    await sql`
      ALTER TABLE user_vocabulary
      ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.5,
      ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0
    `;
    
    console.log('✓ Added SRS columns to user_vocabulary table');
    
    console.log('\nVerifying user_vocabulary columns...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_vocabulary'
      ORDER BY ordinal_position
    `;
    
    console.log('\nuser_vocabulary columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n✓ All columns added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

addMissingColumns();
