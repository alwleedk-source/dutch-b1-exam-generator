import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    // Check user_vocabulary table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_vocabulary'
      ORDER BY ordinal_position;
    `;
    
    console.log('user_vocabulary table columns:');
    console.table(columns);
    
    // Try to insert a test record to see the actual error
    console.log('\nAttempting test insert...');
    const testDate = new Date().toISOString();
    console.log('Test date:', testDate);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkSchema();
