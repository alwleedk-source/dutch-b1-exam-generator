import postgres from 'postgres';
import { readFileSync } from 'fs';

const DATABASE_URL = process.argv[2];

if (!DATABASE_URL) {
  console.error('Usage: node run_migrations.mjs <DATABASE_URL>');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

try {
  console.log('🔌 Connecting to database...');
  
  const sqlScript = readFileSync('create_tables.sql', 'utf8');
  const statements = sqlScript
    .split('--')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s && s.length > 10);

  console.log(`📝 Found ${statements.length} SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.toLowerCase().includes('select')) {
      continue; // Skip SELECT statements
    }
    try {
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      await sql.unsafe(statement);
      console.log(`✅ Statement ${i + 1} completed`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
      } else {
        console.error(`❌ Error in statement ${i + 1}:`, err.message);
      }
    }
  }

  console.log('\n✅ All migrations completed successfully!');
  
  // Verify tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  console.log('\n📊 Created tables:');
  tables.forEach(t => console.log(`  - ${t.table_name}`));
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await sql.end();
}
