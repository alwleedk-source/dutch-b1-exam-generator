import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'vocabulary'
      ORDER BY ordinal_position;
    `;
    
    console.log('vocabulary table columns:');
    console.table(columns);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkSchema();
