import DOMPurify from 'dompurify';

/**
 * Clean pasted text from Word, Google Docs, etc.
 * Removes HTML tags, formatting codes, and unwanted characters
 */
export function cleanPastedText(html: string): string {
  // First, sanitize HTML
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });

  // Convert HTML to plain text while preserving structure
  const temp = document.createElement('div');
  temp.innerHTML = clean;

  // Extract text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up common issues
  text = text
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    // Remove spaces at start/end of lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove more than 2 consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim start and end
    .trim();

  return text;
}

/**
 * Format Dutch text with proper spacing and punctuation
 */
export function formatDutchText(text: string): string {
  let formatted = text;

  // Fix spacing around punctuation
  formatted = formatted
    // Remove space before punctuation
    .replace(/\s+([.,!?;:])/g, '$1')
    // Add space after punctuation if missing
    .replace(/([.,!?;:])([^\s\d])/g, '$1 $2')
    // Fix quotes
    .replace(/\s+"/g, ' "')
    .replace(/"\s+/g, '" ')
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Capitalize first letter of each sentence
  formatted = formatted.replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
    return separator + letter.toUpperCase();
  });

  return formatted;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text: string): number {
  const wordCount = countWords(text);
  return Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
}

/**
 * Validate if text is long enough
 */
export function isTextLongEnough(text: string, minWords: number = 50): boolean {
  return countWords(text) >= minWords;
}
