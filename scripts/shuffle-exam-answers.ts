/**
 * Migration script to shuffle answer positions in existing exams
 * This fixes the issue where correct answers were always at position A (index 0)
 * 
 * Usage: npx tsx scripts/shuffle-exam-answers.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { exams } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

interface Question {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    skillType?: string;
    difficulty?: string;
    explanation?: string;
    evidence?: string;
}

/**
 * Fisher-Yates shuffle algorithm - returns shuffled array and index mapping
 */
function shuffleWithMapping(array: string[]): { shuffled: string[]; originalToNew: number[] } {
    const shuffled = [...array];
    const indexMap = array.map((_, i) => i); // Track where each original index went

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        [indexMap[i], indexMap[j]] = [indexMap[j], indexMap[i]];
    }

    // Create reverse mapping: where did original index end up?
    const originalToNew: number[] = [];
    indexMap.forEach((originalIdx, newIdx) => {
        originalToNew[originalIdx] = newIdx;
    });

    return { shuffled, originalToNew };
}

async function shuffleExamAnswers() {
    console.log("🔄 Starting exam answer shuffle migration...\n");

    const client = postgres(DATABASE_URL);
    const db = drizzle(client);

    try {
        // Get all exams with questions
        const allExams = await db.select({
            id: exams.id,
            questions: exams.questions,
        }).from(exams);

        console.log(`📊 Found ${allExams.length} exams to process\n`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const exam of allExams) {
            try {
                if (!exam.questions) {
                    skippedCount++;
                    continue;
                }

                const questions: Question[] = JSON.parse(exam.questions);

                // Check if questions is a valid array
                if (!Array.isArray(questions) || questions.length === 0) {
                    skippedCount++;
                    continue;
                }

                // Shuffle each question's options
                const shuffledQuestions = questions.map((q, qIndex) => {
                    if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                        console.warn(`  ⚠️ Exam ${exam.id}, Question ${qIndex + 1}: Invalid options array`);
                        return q;
                    }

                    // Get the correct answer before shuffling
                    const correctAnswer = q.options[q.correctAnswerIndex];

                    // Shuffle options
                    const { shuffled } = shuffleWithMapping(q.options);

                    // Find where the correct answer ended up
                    const newCorrectIndex = shuffled.indexOf(correctAnswer);

                    return {
                        ...q,
                        options: shuffled,
                        correctAnswerIndex: newCorrectIndex,
                    };
                });

                // Update the exam
                await db.update(exams)
                    .set({ questions: JSON.stringify(shuffledQuestions) })
                    .where(eq(exams.id, exam.id));

                updatedCount++;

                if (updatedCount % 50 === 0) {
                    console.log(`  ✅ Processed ${updatedCount} exams...`);
                }

            } catch (error) {
                console.error(`  ❌ Error processing exam ${exam.id}:`, error);
                errorCount++;
            }
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 Migration Summary:");
        console.log("=".repeat(50));
        console.log(`  ✅ Updated: ${updatedCount} exams`);
        console.log(`  ⏭️ Skipped: ${skippedCount} exams (no questions)`);
        console.log(`  ❌ Errors: ${errorCount} exams`);
        console.log("=".repeat(50));
        console.log("\n🎉 Migration completed successfully!");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run the migration
shuffleExamAnswers();
