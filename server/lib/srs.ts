/**
 * Spaced Repetition System (SRS) using SM-2 Algorithm
 * 
 * The SM-2 algorithm calculates the optimal interval for reviewing items
 * based on the user's performance in previous reviews.
 * 
 * Quality ratings (0-5):
 * 0 - Complete blackout
 * 1 - Incorrect response; correct one remembered
 * 2 - Incorrect response; correct one seemed easy to recall
 * 3 - Correct response recalled with serious difficulty
 * 4 - Correct response after hesitation
 * 5 - Perfect response
 */

export interface SRSCard {
  ease_factor: number;      // Difficulty multiplier (default: 2.5)
  interval: number;         // Days until next review
  repetitions: number;      // Number of successful reviews
  next_review_at: Date;       // When to review next
}

export interface SRSResult {
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: Date;
}

/**
 * Calculate next review schedule using SM-2 algorithm
 * @param quality - User's performance rating (0-5)
 * @param card - Current SRS card state
 * @returns Updated SRS card state
 */
export function calculateNextReview(quality: number, card: SRSCard): SRSResult {
  let { ease_factor, interval, repetitions } = card;

  // Update ease factor based on quality
  ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // If quality < 3, reset repetitions and interval
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
  }

  // Calculate next review date
  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval);

  return {
    ease_factor,
    interval,
    repetitions,
    next_review_at,
  };
}

/**
 * Initialize a new SRS card with default values
 */
export function initializeSRSCard(): SRSCard {
  return {
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
    next_review_at: new Date(),
  };
}

/**
 * Check if a card is due for review
 */
export function isDueForReview(next_review_at: Date): boolean {
  return new Date() >= next_review_at;
}

/**
 * Get cards due for review from a list
 */
export function getDueCards<T extends { next_review_at: Date }>(cards: T[]): T[] {
  const now = new Date();
  return cards.filter(card => card.next_review_at <= now);
}

/**
 * Calculate mastery level based on SRS stats
 * @returns Mastery percentage (0-100)
 */
export function calculateMastery(repetitions: number, ease_factor: number): number {
  // Mastery increases with repetitions and ease factor
  const repetitionScore = Math.min(repetitions * 10, 60); // Max 60% from repetitions
  const easeScore = Math.min((ease_factor - 1.3) / (2.5 - 1.3) * 40, 40); // Max 40% from ease
  return Math.min(Math.round(repetitionScore + easeScore), 100);
}
