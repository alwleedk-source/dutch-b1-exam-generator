// @ts-ignore - no types available for minhash
import { MinHash } from 'minhash';

/**
 * Text Similarity Detection using MinHash Algorithm
 * 
 * MinHash is a probabilistic data structure for estimating
 * the similarity between two sets (Jaccard similarity).
 * 
 * Perfect for detecting duplicate or near-duplicate texts efficiently.
 */

const NUM_PERM = 128; // Number of permutations (higher = more accurate but slower)

/**
 * Tokenize text into shingles (n-grams)
 * @param text - Input text
 * @param n - Shingle size (default: 3)
 * @returns Array of shingles
 */
function getShingles(text: string, n: number = 3): string[] {
  // Normalize text: lowercase, remove extra spaces
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  const shingles: string[] = [];
  for (let i = 0; i <= normalized.length - n; i++) {
    shingles.push(normalized.substring(i, i + n));
  }
  
  return shingles;
}

/**
 * Calculate MinHash signature for a text
 * @param text - Input text
 * @returns MinHash signature as array of numbers
 */
export function calculateMinHash(text: string): number[] {
  const mh = new MinHash(NUM_PERM);
  const shingles = getShingles(text);
  
  for (const shingle of shingles) {
    mh.update(shingle);
  }
  
  return Array.from(mh.digest());
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
  const similarTexts = findSimilarTexts(signature, existingTexts, 0.8);
  
  return {
    isDuplicate: similarTexts.length > 0,
    signature,
    similarTexts,
  };
}
