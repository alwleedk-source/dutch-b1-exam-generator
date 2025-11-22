/**
 * Calculate dynamic question count based on text length
 * Following official NT2 exam patterns with increased question density
 */
export function calculateQuestionCount(textLength: number): number {
  // Count words (approximate: 5 characters per word on average)
  const wordCount = Math.round(textLength / 5);
  
  let questionCount: number;
  
  if (wordCount < 200) {
    // Very short texts (< 1000 chars): 6 questions minimum
    questionCount = 6;
  } else if (wordCount < 400) {
    // Short texts (1000-2000 chars): 8 questions
    questionCount = 8;
  } else if (wordCount < 600) {
    // Medium-short texts (2000-3000 chars): 9 questions
    questionCount = 9;
  } else if (wordCount < 800) {
    // Medium texts (3000-4000 chars): 10 questions
    questionCount = 10;
  } else if (wordCount < 1000) {
    // Medium-long texts (4000-5000 chars): 11 questions
    questionCount = 11;
  } else if (wordCount < 1200) {
    // Long texts (5000-6000 chars): 12 questions
    questionCount = 12;
  } else if (wordCount < 1400) {
    // Long texts (6000-7000 chars): 13 questions
    questionCount = 13;
  } else if (wordCount < 1600) {
    // Very long texts (7000-8000 chars): 14 questions
    questionCount = 14;
  } else {
    // Extra long texts (8000+ chars): 15 questions (maximum)
    questionCount = 15;
  }
  
  return questionCount;
}

/**
 * Calculate exam time based on text length and question count
 * Formula: Reading time + Question time
 * - Reading time: wordCount / 150 (words per minute for comprehension)
 * - Question time: questionCount * 2.8 minutes (Staatsexamen standard)
 */
export function calculateExamTime(textLength: number, questionCount: number): number {
  // Calculate word count
  const wordCount = Math.round(textLength / 5);
  
  // Reading time: 150 words per minute for comprehension and searching
  const readingTimeMinutes = Math.ceil(wordCount / 150);
  
  // Question time: 2.8 minutes per question (Staatsexamen standard: 110 min / 39 questions)
  const questionTimeMinutes = Math.round(questionCount * 2.8);
  
  // Total exam time
  const totalTime = readingTimeMinutes + questionTimeMinutes;
  
  return totalTime;
}

/**
 * Get recommended question count with explanation
 */
export function getQuestionCountInfo(textLength: number): {
  count: number;
  min: number;
  max: number;
  examTimeMinutes: number;
  explanation: string;
} {
  const count = calculateQuestionCount(textLength);
  const wordCount = Math.round(textLength / 5);
  const examTime = calculateExamTime(textLength, count);
  
  return {
    count,
    min: 6,
    max: 15,
    examTimeMinutes: examTime,
    explanation: `Based on ${textLength} characters (~${wordCount} words): ${count} questions, ${examTime} minutes exam time (following Staatsexamen standards)`
  };
}
