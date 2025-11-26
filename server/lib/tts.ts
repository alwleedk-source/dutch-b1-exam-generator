import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { uploadToR2 } from './r2';
import crypto from 'crypto';

let ttsClient: TextToSpeechClient | null = null;

/**
 * Get or initialize TTS client with proper error handling
 */
function getTTSClient() {
  if (!ttsClient) {
    try {
      let credentials;
      
      // Priority 1: Base64-encoded credentials (recommended for Coolify/Docker)
      if (process.env.GOOGLE_TTS_CREDENTIALS_BASE64) {
        try {
          const decoded = Buffer.from(process.env.GOOGLE_TTS_CREDENTIALS_BASE64, 'base64').toString('utf-8');
          credentials = JSON.parse(decoded);
          console.log('[TTS] Successfully decoded GOOGLE_TTS_CREDENTIALS_BASE64');
          
          // Validate required fields
          const required = ['type', 'project_id', 'private_key', 'client_email'];
          const missing = required.filter(field => !credentials[field]);
          if (missing.length > 0) {
            throw new Error(`Missing required fields in credentials: ${missing.join(', ')}`);
          }
          
        } catch (decodeError: any) {
          console.error('[TTS] Failed to decode GOOGLE_TTS_CREDENTIALS_BASE64:', decodeError.message);
          throw new Error(`Invalid GOOGLE_TTS_CREDENTIALS_BASE64: ${decodeError.message}`);
        }
      }
      // Priority 2: Direct JSON string (may have escaping issues in some environments)
      else if (process.env.GOOGLE_TTS_CREDENTIALS) {
        try {
          credentials = JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS);
          console.log('[TTS] Successfully parsed GOOGLE_TTS_CREDENTIALS');
          
          // Validate required fields
          const required = ['type', 'project_id', 'private_key', 'client_email'];
          const missing = required.filter(field => !credentials[field]);
          if (missing.length > 0) {
            throw new Error(`Missing required fields in credentials: ${missing.join(', ')}`);
          }
          
        } catch (parseError: any) {
          console.error('[TTS] Failed to parse GOOGLE_TTS_CREDENTIALS:', parseError.message);
          console.error('[TTS] First 100 chars:', process.env.GOOGLE_TTS_CREDENTIALS.substring(0, 100));
          throw new Error(`Invalid GOOGLE_TTS_CREDENTIALS JSON: ${parseError.message}`);
        }
      }
      // Priority 3: File path (requires manual file management)
      else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('[TTS] Using GOOGLE_APPLICATION_CREDENTIALS file path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
        // When using file path, don't pass credentials - the SDK will read the file automatically
        credentials = undefined;
      } else {
        console.warn('[TTS] No Google TTS credentials found. Set GOOGLE_TTS_CREDENTIALS_BASE64, GOOGLE_TTS_CREDENTIALS, or GOOGLE_APPLICATION_CREDENTIALS.');
        return null;
      }

      ttsClient = new TextToSpeechClient(
        credentials ? { credentials } : {}
      );

      console.log('[TTS] Google TTS client initialized successfully');
    } catch (error: any) {
      console.error('[TTS] Failed to initialize TTS client:', {
        message: error.message,
        stack: error.stack?.substring(0, 200),
      });
      throw error; // Re-throw to make the error visible
    }
  }
  return ttsClient;
}

export interface TTSOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
}

/**
 * Generate speech from text using Google Cloud TTS
 */
/**
 * Best Standard voices for Dutch (Netherlands)
 * Selected for clarity and naturalness in educational context
 */
const DUTCH_STANDARD_VOICES = [
  'nl-NL-Standard-B', // Male - Very clear (best for learning)
  'nl-NL-Standard-C', // Male - Natural
  'nl-NL-Standard-D', // Female - Clear
];

/**
 * Get a random voice from the best Dutch Standard voices
 */
function getRandomDutchVoice(): string {
  const randomIndex = Math.floor(Math.random() * DUTCH_STANDARD_VOICES.length);
  return DUTCH_STANDARD_VOICES[randomIndex];
}

export async function generateSpeech(options: TTSOptions): Promise<{ audioUrl: string; audioKey: string }> {
  const {
    text,
    languageCode = 'nl-NL',
    voiceName, // Will be randomly selected if not provided
    audioEncoding = 'MP3',
  } = options;
  
  // Use random voice if not specified
  const selectedVoice = voiceName || getRandomDutchVoice();

  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (text.length > 5000) {
    throw new Error('Text is too long (max 5000 characters)');
  }

  try {
    const client = getTTSClient();

    // Verify client is properly initialized
    if (!client) {
      throw new Error('TTS client is not initialized. Check GOOGLE_TTS_CREDENTIALS environment variable.');
    }

    // Normalize text: trim whitespace
    const normalizedText = text.trim();

    // Construct the request
    const request = {
      input: { text: normalizedText },
      voice: {
        languageCode,
        name: selectedVoice,
      },
      audioConfig: {
        audioEncoding,
      },
    };

    console.log(`[TTS] Generating speech for: "${normalizedText.substring(0, 50)}${normalizedText.length > 50 ? '...' : ''}" using voice: ${selectedVoice}`);

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    console.log(`[TTS] Successfully received audio content (${response.audioContent.length} bytes)`);

    // Generate unique filename using MD5 hash to avoid special characters in base64
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(normalizedText).digest('hex').slice(0, 8);
    const extension = audioEncoding === 'MP3' ? 'mp3' : audioEncoding === 'OGG_OPUS' ? 'ogg' : 'wav';
    const filename = `tts/${languageCode}/${hash}-${timestamp}.${extension}`;

    // Upload to R2
    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
    const contentType = audioEncoding === 'MP3' ? 'audio/mpeg' : audioEncoding === 'OGG_OPUS' ? 'audio/ogg' : 'audio/wav';
    
    console.log(`[TTS] Uploading to R2: ${filename} (${audioBuffer.length} bytes)`);
    const audioUrl = await uploadToR2(filename, audioBuffer, contentType);

    if (!audioUrl) {
      throw new Error('Failed to upload audio to R2: No URL returned');
    }

    console.log(`[TTS] Successfully generated and uploaded audio: ${audioUrl}`);

    return {
      audioUrl,
      audioKey: filename,
    };
  } catch (error: any) {
    // Detailed error logging
    console.error('[TTS] Failed to generate speech:', {
      text: text.substring(0, 100),
      languageCode,
      voiceName,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
    });

    // Throw specific error messages based on error type
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Cannot connect to Google TTS API');
    } else if (error.message?.includes('quota') || error.code === 8) {
      throw new Error('Google TTS quota exceeded. Please try again later.');
    } else if (error.message?.includes('credentials') || error.message?.includes('Invalid GOOGLE_TTS_CREDENTIALS') || error.code === 16) {
      throw new Error('Invalid or missing Google TTS credentials. Please check GOOGLE_TTS_CREDENTIALS environment variable.');
    } else if (error.message?.includes('R2')) {
      throw new Error(`R2 Storage error: ${error.message}`);
    } else if (error.message?.includes('empty') || error.message?.includes('too long')) {
      throw error; // Re-throw validation errors as-is
    } else {
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }
}

/**
 * Generate speech with retry mechanism for transient errors
 */
async function generateSpeechWithRetry(
  options: TTSOptions,
  maxRetries: number = 3
): Promise<{ audioUrl: string; audioKey: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TTS] Attempt ${attempt}/${maxRetries} for: "${options.text.substring(0, 50)}${options.text.length > 50 ? '...' : ''}"`);
      return await generateSpeech(options);
    } catch (error: any) {
      lastError = error;
      console.error(`[TTS] Attempt ${attempt} failed:`, error.message);

      // Don't retry for certain errors (permanent failures)
      if (error.message?.includes('credentials') || 
          error.message?.includes('Invalid') ||
          error.message?.includes('empty') ||
          error.message?.includes('too long')) {
        console.log(`[TTS] Not retrying due to permanent error type`);
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`[TTS] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Failed to generate speech after retries');
}

/**
 * Generate Dutch speech (convenience function)
 */
export async function generateDutchSpeech(text: string): Promise<{ audioUrl: string; audioKey: string }> {
  return generateSpeechWithRetry({
    text,
    languageCode: 'nl-NL',
    // voiceName is not specified, so a random voice will be selected from DUTCH_STANDARD_VOICES
    audioEncoding: 'MP3',
  });
}
