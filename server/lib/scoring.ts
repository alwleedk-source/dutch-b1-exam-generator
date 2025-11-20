/**
 * Calculate Staatsexamen NT2 Lezen I official score based on correct answers
 * Based on official scoring table from 2022 exam
 */

// Official scoring table: correct answers -> Staatsexamen score
const SCORING_TABLE: Record<number, number> = {
  0: 276,
  1: 337,
  2: 364,
  3: 380,
  4: 393,
  5: 403,
  6: 411,
  7: 419,
  8: 426,
  9: 432,
  10: 438,
  11: 443,
  12: 448,
  13: 453,
  14: 458,
  15: 462,
  16: 467,
  17: 471,
  18: 476,
  19: 480,
  20: 485,
  21: 490,
  22: 494,
  23: 500, // Minimum passing score
  24: 505,
  25: 511,
  26: 518,
  27: 525,
  28: 533,
  29: 542,
  30: 554,
  31: 568,
  32: 586,
  33: 611,
  34: 651,
  35: 740,
};

/**
 * Convert correct answer count to official Staatsexamen score
 * @param correctAnswers Number of correct answers (0-35)
 * @returns Staatsexamen score (276-740)
 */
export function calculateStaatsexamenScore(correctAnswers: number): number {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(35, correctAnswers));
  
  // Return score from table
  return SCORING_TABLE[clamped] || 276;
}

/**
 * Check if score is passing (500 or higher)
 * @param score Staatsexamen score
 * @returns true if passing
 */
export function isPassing(score: number): boolean {
  return score >= 500;
}

/**
 * Get score level description
 * @param score Staatsexamen score
 * @returns Level description in Dutch
 */
export function getScoreLevel(score: number): string {
  if (score >= 700) return "Uitstekend";
  if (score >= 600) return "Zeer goed";
  if (score >= 550) return "Goed";
  if (score >= 500) return "Voldoende";
  if (score >= 450) return "Onvoldoende";
  return "Ruim onvoldoende";
}

/**
 * Analyze performance by question type
 * @param questions Array of questions with type and correctness
 * @returns Performance analysis by question type
 */
export interface QuestionPerformance {
  questionType: string;
  total: number;
  correct: number;
  percentage: number;
}

export function analyzePerformanceByType(
  questions: Array<{
    questionType?: string;
    correctAnswerIndex?: number;
  }>,
  userAnswers: string[]
): QuestionPerformance[] {
  const typeStats: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q, index) => {
    const type = q.questionType || "Unknown";
    
    if (!typeStats[type]) {
      typeStats[type] = { total: 0, correct: 0 };
    }
    
    typeStats[type].total++;
    
    // Check if answer is correct
    const correctAnswer = String.fromCharCode(65 + (q.correctAnswerIndex || 0)); // Convert 0->A, 1->B, etc.
    if (userAnswers[index] === correctAnswer) {
      typeStats[type].correct++;
    }
  });

  return Object.entries(typeStats).map(([questionType, stats]) => ({
    questionType,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100),
  }));
}

/**
 * Generate personalized recommendations based on performance
 * @param performance Performance analysis by question type
 * @returns Recommendations in Dutch
 */
export function generateRecommendations(performance: QuestionPerformance[]): string[] {
  const recommendations: string[] = [];

  performance.forEach(p => {
    if (p.percentage < 50) {
      switch (p.questionType) {
        case "Main Idea":
          recommendations.push(
            "Je hebt moeite met hoofdidee vragen. Tip: Lees eerst de titel en de eerste en laatste alinea om de hoofdgedachte te begrijpen."
          );
          break;
        case "Scanning":
          recommendations.push(
            "Je moet beter worden in het scannen naar details. Tip: Zoek naar sleutelwoorden in de vraag en scan de tekst snel om deze woorden te vinden."
          );
          break;
        case "Sequencing":
          recommendations.push(
            "Volgorde vragen zijn lastig voor je. Tip: Let op signaalwoorden zoals 'eerst', 'daarna', 'vervolgens', 'ten slotte'."
          );
          break;
        case "Inference":
          recommendations.push(
            "Je moet werken aan inferentie vaardigheden. Tip: Lees tussen de regels en probeer te begrijpen wat de auteur bedoelt zonder het direct te zeggen."
          );
          break;
        case "Vocabulary":
          recommendations.push(
            "Je woordenschat moet uitgebreid worden. Tip: Probeer de betekenis van woorden af te leiden uit de context voordat je ze opzoekt."
          );
          break;
      }
    }
  });

  if (recommendations.length === 0) {
    recommendations.push("Goed gedaan! Je prestaties zijn uitstekend. Blijf oefenen om je niveau te behouden.");
  }

  return recommendations;
}
