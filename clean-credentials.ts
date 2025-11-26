#!/usr/bin/env tsx
/**
 * Clean and validate Google TTS credentials JSON
 * 
 * This script:
 * 1. Reads JSON from file or stdin
 * 2. Validates it
 * 3. Removes extra whitespace
 * 4. Outputs clean, minified JSON
 * 
 * Usage:
 *   # From file
 *   npx tsx clean-credentials.ts credentials.json
 * 
 *   # From stdin
 *   cat credentials.json | npx tsx clean-credentials.ts
 * 
 *   # From environment variable
 *   echo $GOOGLE_TTS_CREDENTIALS | npx tsx clean-credentials.ts
 */

import * as fs from 'fs';

async function main() {
  let jsonString: string;

  // Read from file or stdin
  if (process.argv[2]) {
    // Read from file
    const filePath = process.argv[2];
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }
    jsonString = fs.readFileSync(filePath, 'utf-8');
    console.log(`📂 Reading from file: ${filePath}\n`);
  } else {
    // Read from stdin
    console.log('📥 Reading from stdin (paste JSON and press Ctrl+D)...\n');
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    jsonString = Buffer.concat(chunks).toString('utf-8');
  }

  console.log('🔍 Original JSON (first 200 chars):');
  console.log(jsonString.substring(0, 200) + '...\n');

  // Try to parse
  let credentials: any;
  try {
    credentials = JSON.parse(jsonString);
    console.log('✅ JSON is valid!\n');
  } catch (error: any) {
    console.error('❌ JSON parsing failed:', error.message);
    console.error('\n💡 Common issues:');
    console.error('1. Extra whitespace or special characters');
    console.error('2. Single quotes instead of double quotes');
    console.error('3. Missing or extra commas');
    console.error('4. Unescaped newlines in private_key\n');
    
    // Try to identify the issue
    const errorMatch = error.message.match(/position (\d+)/);
    if (errorMatch) {
      const position = parseInt(errorMatch[1]);
      console.error(`❌ Error at position ${position}:`);
      console.error('   Context: "' + jsonString.substring(Math.max(0, position - 20), position + 20) + '"');
      console.error('            ' + ' '.repeat(20) + '^');
    }
    
    process.exit(1);
  }

  // Validate required fields
  console.log('🔍 Validating required fields...\n');
  
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri',
  ];

  let allFieldsPresent = true;
  for (const field of requiredFields) {
    if (credentials[field]) {
      const value = typeof credentials[field] === 'string' 
        ? credentials[field].substring(0, 50) + (credentials[field].length > 50 ? '...' : '')
        : 'present';
      console.log(`✅ ${field.padEnd(20)}: ${value}`);
    } else {
      console.error(`❌ ${field.padEnd(20)}: MISSING`);
      allFieldsPresent = false;
    }
  }

  if (!allFieldsPresent) {
    console.error('\n❌ Some required fields are missing');
    process.exit(1);
  }

  // Validate specific fields
  console.log('\n🔍 Validating field values...\n');

  if (credentials.type !== 'service_account') {
    console.error(`❌ Invalid type: "${credentials.type}" (expected "service_account")`);
    process.exit(1);
  }
  console.log('✅ type is correct: service_account');

  if (!credentials.private_key.includes('BEGIN PRIVATE KEY')) {
    console.error('❌ private_key does not contain "BEGIN PRIVATE KEY"');
    process.exit(1);
  }
  console.log('✅ private_key format looks correct');

  if (!credentials.client_email.includes('@') || !credentials.client_email.includes('.iam.gserviceaccount.com')) {
    console.error(`❌ Invalid client_email format: "${credentials.client_email}"`);
    process.exit(1);
  }
  console.log(`✅ client_email format is correct`);

  // Clean and minify
  console.log('\n🧹 Cleaning JSON...\n');
  
  const cleanedJSON = JSON.stringify(credentials);
  
  console.log('✅ Cleaned JSON (minified, single line)');
  console.log('📏 Length:', cleanedJSON.length, 'characters\n');
  
  // Output
  console.log('=' .repeat(60));
  console.log('📋 COPY THIS CLEANED JSON:');
  console.log('='.repeat(60));
  console.log(cleanedJSON);
  console.log('='.repeat(60));
  
  // Also save to file
  const outputFile = 'credentials-clean.json';
  fs.writeFileSync(outputFile, cleanedJSON);
  console.log(`\n💾 Also saved to: ${outputFile}`);
  
  // Pretty version for reference
  const prettyJSON = JSON.stringify(credentials, null, 2);
  const prettyFile = 'credentials-pretty.json';
  fs.writeFileSync(prettyFile, prettyJSON);
  console.log(`💾 Pretty version saved to: ${prettyFile}\n`);
  
  console.log('✅ All done! Copy the cleaned JSON above and paste it into Coolify.\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
