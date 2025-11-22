import { createWorker } from 'tesseract.js';

const MAX_TEXT_LENGTH = 10100;

/**
 * Extract Dutch text from an image using Tesseract OCR
 * @param imageBuffer - Image buffer or base64 string
 * @returns Extracted text (max 10,100 characters)
 */
export async function extractTextFromImage(imageBuffer: Buffer | string): Promise<{
  text: string;
  confidence: number;
  isTruncated: boolean;
}> {
  const worker = await createWorker('nld'); // Dutch language
  
  try {
    const { data } = await worker.recognize(imageBuffer);
    
    let extractedText = data.text.trim();
    let isTruncated = false;
    
    // Enforce 10,100 character limit
    if (extractedText.length > MAX_TEXT_LENGTH) {
      extractedText = extractedText.substring(0, MAX_TEXT_LENGTH);
      isTruncated = true;
    }
    
    return {
      text: extractedText,
      confidence: data.confidence,
      isTruncated,
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Validate if extracted text is sufficient for exam generation
 * @param text - Extracted text
 * @returns Validation result
 */
export function validateExtractedText(text: string): {
  isValid: boolean;
  reason?: string;
} {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'No text extracted from image' };
  }
  
  if (text.length < 2000) {
    return { isValid: false, reason: 'Text too short (minimum 2000 characters for quality exam generation)' };
  }
  
  if (text.length > MAX_TEXT_LENGTH) {
    return { isValid: false, reason: `Text too long (maximum ${MAX_TEXT_LENGTH} characters)` };
  }
  
  // Check if text contains mostly readable characters
  const readableChars = text.match(/[a-zA-Z0-9\s]/g);
  if (!readableChars || readableChars.length < text.length * 0.7) {
    return { isValid: false, reason: 'Text contains too many unreadable characters' };
  }
  
  return { isValid: true };
}
