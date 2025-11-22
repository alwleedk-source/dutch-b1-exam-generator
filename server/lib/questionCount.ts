/**
 * Calculate dynamic question count based on text length
 * Following official NT2 exam patterns
 */
export function calculateQuestionCount(textLength: number): number {
  // Count words (approximate: 5 characters per word on average)
  const wordCount = Math.round(textLength / 5);
  
  // Calculate questions based on word count
  // Formula: 1 question per 300-400 words
  let questionCount: number;
  
  if (wordCount < 200) {
    // Very short texts: minimum 4 questions
    questionCount = 4;
  } else if (wordCount < 400) {
    // Short texts (600-2000 chars): 4-5 questions
    questionCount = 5;
  } else if (wordCount < 600) {
    // Medium texts (2000-3000 chars): 5-7 questions
    questionCount = Math.round(wordCount / 100);
  } else if (wordCount < 1000) {
    // Medium-long texts (3000-5000 chars): 7-10 questions
    questionCount = Math.round(wordCount / 100);
  } else {
    // Long texts (5000-10100 chars): 10-15 questions
    questionCount = Math.min(15, Math.round(wordCount / 100));
  }
  
  // Ensure within bounds
  questionCount = Math.max(4, Math.min(15, questionCount));
  
  return questionCount;
}

/**
 * Get recommended question count with explanation
 */
export function getQuestionCountInfo(textLength: number): {
  count: number;
  min: number;
  max: number;
  explanation: string;
} {
  const count = calculateQuestionCount(textLength);
  const wordCount = Math.round(textLength / 5);
  
  return {
    count,
    min: 4,
    max: 15,
    explanation: `Based on ${textLength} characters (~${wordCount} words), recommended ${count} questions (1 question per 300-400 words, following NT2 exam standards)`
  };
}
