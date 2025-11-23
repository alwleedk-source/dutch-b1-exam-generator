/**
 * Text Similarity Detection using MinHash Algorithm
 * 
 * MinHash is a probabilistic data structure for estimating
 * the similarity between two sets (Jaccard similarity).
 * 
 * Perfect for detecting duplicate or near-duplicate texts efficiently.
 */

const NUM_PERM = 128; // Number of permutations (higher = more accurate but slower)
const LARGE_PRIME = 2147483647; // Mersenne prime 2^31 - 1
const MAX_HASH = 4294967295; // 2^32 - 1

/**
 * Simple hash function for strings
 */
function hashString(str: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % MAX_HASH;
}

/**
 * Tokenize text into shingles (word n-grams)
 * @param text - Input text
 * @param n - Shingle size in words (default: 5)
 * @returns Array of word shingles
 */
function getShingles(text: string, n: number = 5): string[] {
  // Normalize text: lowercase, remove extra spaces and punctuation
  const normalized = text.toLowerCase()
    .replace(/[.,!?;:()\[\]{}"']/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Split into words
  const words = normalized.split(' ').filter(w => w.length > 0);
  
  // Create word n-grams (shingles)
  const shingles: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    shingles.push(words.slice(i, i + n).join(' '));
  }
  
  return shingles;
}

/**
 * Calculate MinHash signature for a text
 * @param text - Input text
 * @returns MinHash signature as array of numbers
 */
export function calculateMinHash(text: string): number[] {
  const shingles = getShingles(text);
  const signature: number[] = new Array(NUM_PERM).fill(MAX_HASH);
  
  // Generate random hash functions using different seeds
  for (let i = 0; i < NUM_PERM; i++) {
    const seed = i * 31 + 17; // Simple seed generation
    
    for (const shingle of shingles) {
      const hash = hashString(shingle, seed);
      signature[i] = Math.min(signature[i], hash);
    }
  }
  
  return signature;
}

/**
 * Calculate Jaccard similarity between two MinHash signatures
 * @param sig1 - First MinHash signature
 * @param sig2 - Second MinHash signature
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(sig1: number[], sig2: number[]): number {
  if (sig1.length !== sig2.length) {
    throw new Error('Signatures must have the same length');
  }
  
  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) {
      matches++;
    }
  }
  
  return matches / sig1.length;
}

/**
 * Find similar texts from a list
 * @param targetSignature - MinHash signature of target text
 * @param texts - Array of texts with their signatures
 * @param threshold - Minimum similarity threshold (0-1)
 * @returns Array of similar texts with similarity scores
 */
export function findSimilarTexts(
  targetSignature: number[],
  texts: Array<{ id: number; title: string; signature: number[] }>,
  threshold: number = 0.8
): Array<{ id: number; title: string; similarity: number }> {
  const similar: Array<{ id: number; title: string; similarity: number }> = [];
  
  for (const text of texts) {
    const similarity = calculateSimilarity(targetSignature, text.signature);
    if (similarity >= threshold) {
      similar.push({
        id: text.id,
        title: text.title,
        similarity,
      });
    }
  }
  
  // Sort by similarity (highest first)
  return similar.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Check if a text is duplicate (≥80% similar to existing texts)
 * Rejects texts with 80% or more similarity based on word patterns
 * @param text - New text to check
 * @param existingTexts - Array of existing texts with signatures
 * @returns Object with isDuplicate flag and similar texts
 */
export function checkDuplicate(
  text: string,
  existingTexts: Array<{ id: number; title: string; signature: number[] }>
): {
  isDuplicate: boolean;
  signature: number[];
  similarTexts: Array<{ id: number; title: string; similarity: number }>;
} {
  const signature = calculateMinHash(text);
  const similarTexts = findSimilarTexts(signature, existingTexts, 0.80);
  
  return {
    isDuplicate: similarTexts.length > 0,
    signature,
    similarTexts,
  };
}
