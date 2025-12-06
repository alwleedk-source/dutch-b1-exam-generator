import postgres from 'postgres';

const DATABASE_URL = "postgresql://neondb_owner:npg_GQoXsiDSH3t1@ep-rough-haze-ab2hsjy0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(DATABASE_URL);

async function addMissingColumns() {
  try {
    console.log('Adding questions and answers columns to exams table...');
    
    await sql`
      ALTER TABLE exams
      ADD COLUMN IF NOT EXISTS questions TEXT NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS answers TEXT
    `;
    
    console.log('✓ Added columns to exams table');
    
    // Remove default after adding
    await sql`
      ALTER TABLE exams
      ALTER COLUMN questions DROP DEFAULT
    `;
    
    console.log('✓ Removed default from questions column');
    
    console.log('\nVerifying exams columns...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'exams'
      ORDER BY ordinal_position
    `;
    
    console.log('\nexams columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n✓ All columns added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

addMissingColumns();
