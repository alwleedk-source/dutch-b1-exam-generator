#!/usr/bin/env tsx
/**
 * Script to validate Google TTS credentials
 * Run this to check if GOOGLE_TTS_CREDENTIALS is properly configured
 * 
 * Usage:
 *   npx tsx validate-credentials.ts
 */

console.log('🔍 Validating Google TTS Credentials...\n');

// Check if GOOGLE_TTS_CREDENTIALS is set
if (!process.env.GOOGLE_TTS_CREDENTIALS) {
  console.error('❌ GOOGLE_TTS_CREDENTIALS is not set');
  console.log('\n💡 Solutions:');
  console.log('1. Set GOOGLE_TTS_CREDENTIALS environment variable with valid JSON');
  console.log('2. Or set GOOGLE_APPLICATION_CREDENTIALS to point to a JSON file');
  process.exit(1);
}

console.log('✅ GOOGLE_TTS_CREDENTIALS is set');
console.log(`   Length: ${process.env.GOOGLE_TTS_CREDENTIALS.length} characters\n`);

// Try to parse JSON
let credentials: any;
try {
  credentials = JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS);
  console.log('✅ JSON is valid\n');
} catch (error: any) {
  console.error('❌ Invalid JSON:', error.message);
  console.error('\n📋 First 200 characters of GOOGLE_TTS_CREDENTIALS:');
  console.error(process.env.GOOGLE_TTS_CREDENTIALS.substring(0, 200));
  console.error('\n💡 Common issues:');
  console.error('1. Using single quotes instead of double quotes');
  console.error('2. Missing or extra commas');
  console.error('3. Unescaped newlines in private_key (use \\n)');
  console.error('4. Special characters not properly escaped');
  console.error('\n🔧 Try validating your JSON at: https://jsonlint.com');
  process.exit(1);
}

// Check required fields
console.log('📋 Checking required fields...\n');

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
    console.log(`✅ ${field}: ${typeof credentials[field] === 'string' ? credentials[field].substring(0, 50) + '...' : 'present'}`);
  } else {
    console.error(`❌ ${field}: MISSING`);
    allFieldsPresent = false;
  }
}

if (!allFieldsPresent) {
  console.error('\n❌ Some required fields are missing');
  console.error('💡 Make sure you copied the complete service account JSON from Google Cloud Console');
  process.exit(1);
}

// Validate specific fields
console.log('\n🔍 Validating field values...\n');

// Check type
if (credentials.type !== 'service_account') {
  console.error(`❌ Invalid type: "${credentials.type}" (expected "service_account")`);
  process.exit(1);
}
console.log('✅ Type is correct: service_account');

// Check private_key format
if (!credentials.private_key.includes('BEGIN PRIVATE KEY')) {
  console.error('❌ private_key does not contain "BEGIN PRIVATE KEY"');
  console.error('💡 Make sure the private key is complete and properly formatted');
  process.exit(1);
}
console.log('✅ private_key format looks correct');

// Check if private_key has proper newlines
if (!credentials.private_key.includes('\\n') && !credentials.private_key.includes('\n')) {
  console.warn('⚠️  private_key may not have proper line breaks');
  console.warn('💡 Make sure newlines are escaped as \\n in the JSON');
}

// Check email format
if (!credentials.client_email.includes('@') || !credentials.client_email.includes('.iam.gserviceaccount.com')) {
  console.error(`❌ Invalid client_email format: "${credentials.client_email}"`);
  console.error('💡 Should be like: your-service-account@your-project.iam.gserviceaccount.com');
  process.exit(1);
}
console.log(`✅ client_email format is correct: ${credentials.client_email}`);

// Try to initialize TTS client
console.log('\n🔧 Testing Google TTS client initialization...\n');

try {
  const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
  
  const client = new TextToSpeechClient({
    credentials,
  });
  
  console.log('✅ TTS client initialized successfully');
  
  // Try a simple test request (list voices)
  console.log('\n🎤 Testing TTS API connection...\n');
  
  try {
    const [result] = await client.listVoices({ languageCode: 'nl-NL' });
    console.log(`✅ Successfully connected to Google TTS API`);
    console.log(`   Found ${result.voices?.length || 0} Dutch voices`);
    
    if (result.voices && result.voices.length > 0) {
      console.log('\n📢 Available Dutch voices:');
      result.voices.slice(0, 5).forEach((voice: any) => {
        console.log(`   - ${voice.name} (${voice.ssmlGender})`);
      });
      if (result.voices.length > 5) {
        console.log(`   ... and ${result.voices.length - 5} more`);
      }
    }
    
  } catch (apiError: any) {
    console.error('❌ Failed to connect to Google TTS API:', apiError.message);
    console.error('\n💡 Possible issues:');
    console.error('1. Service account does not have Text-to-Speech API enabled');
    console.error('2. Service account does not have proper permissions');
    console.error('3. API quota exceeded');
    console.error('4. Network connectivity issues');
    process.exit(1);
  }
  
} catch (error: any) {
  console.error('❌ Failed to initialize TTS client:', error.message);
  process.exit(1);
}

console.log('\n✅ All validation checks passed!');
console.log('🎉 Your Google TTS credentials are properly configured\n');
