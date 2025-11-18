import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { uploadToR2 } from './r2';

let ttsClient: TextToSpeechClient | null = null;

function getTTSClient() {
  if (!ttsClient) {
    // Google Cloud TTS will use GOOGLE_APPLICATION_CREDENTIALS env var
    // or fall back to Application Default Credentials
    ttsClient = new TextToSpeechClient({
      credentials: process.env.GOOGLE_TTS_CREDENTIALS 
        ? JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS)
        : undefined,
    });
  }
  return ttsClient;
}

export interface TTSOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
}

export async function generateSpeech(options: TTSOptions): Promise<{ audioUrl: string; audioKey: string }> {
  const {
    text,
    languageCode = 'nl-NL',
    voiceName = 'nl-NL-Standard-A',
    audioEncoding = 'MP3',
  } = options;

  try {
    const client = getTTSClient();

    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const hash = Buffer.from(text).toString('base64').slice(0, 8);
    const extension = audioEncoding === 'MP3' ? 'mp3' : audioEncoding === 'OGG_OPUS' ? 'ogg' : 'wav';
    const filename = `tts/${languageCode}/${hash}-${timestamp}.${extension}`;

    // Upload to R2
    const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
    const contentType = audioEncoding === 'MP3' ? 'audio/mpeg' : audioEncoding === 'OGG_OPUS' ? 'audio/ogg' : 'audio/wav';
    
    const audioUrl = await uploadToR2(filename, audioBuffer, contentType);

    return {
      audioUrl,
      audioKey: filename,
    };
  } catch (error) {
    console.error('[TTS] Failed to generate speech:', error);
    throw new Error('Failed to generate speech');
  }
}

export async function generateDutchSpeech(text: string): Promise<{ audioUrl: string; audioKey: string }> {
  return generateSpeech({
    text,
    languageCode: 'nl-NL',
    voiceName: 'nl-NL-Standard-A',
    audioEncoding: 'MP3',
  });
}
