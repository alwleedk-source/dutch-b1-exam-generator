// Database modules - re-export all functions
// This file provides backwards compatibility with the original db.ts

export { sql } from "drizzle-orm";

// Re-export connection
export { getDb } from "./connection";

// Re-export user functions
export {
    upsertUser,
    getUserByOpenId,
    getUserById,
    updateUserPreferences,
    updateUserStats,
    getAllUsers,
} from "./users";

// Re-export text functions
export {
    createText,
    checkDuplicateText,
    getTextById,
    getTextsByUser,
    getUserTextsCreatedAfter,
    getApprovedTexts,
    getPendingTexts,
    updateTextStatus,
    updateTextValidation,
    getAllTexts,
    deleteText,
} from "./texts";

// Re-export exam functions
export {
    createExam,
    getExamById,
    getExamsByUser,
    getCompletedExamsByUser,
    getExamsByTextId,
    updateExam,
    getUserExamStats,
    getAllExams,
    deleteExam,
    deleteOldIncompleteExams,
} from "./exams";

// TODO: The following functions still need to be migrated from db.ts:
// - Translation functions (createTranslation, getTranslationByTextId, updateTranslation)
// - Vocabulary functions (createVocabulary, findVocabularyByWordAndContext, etc.)
// - User Vocabulary functions (createUserVocabulary, getUserVocabularyProgress, etc.)
// - Report functions (createReport, getReportsByTextId, etc.)
// - Achievement functions (createAchievement, getUserAchievements, etc.)
// - Leaderboard functions (getLeaderboard)
// - SRS functions (getUserVocabularyById, updateUserVocabularySRS, etc.)
// - Admin functions (getUserExams, getUserTexts, deleteUser, etc.)
// - Text Rating functions (rateText, getTextsWithRatings, etc.)
// - Topic Suggestion functions (createTopicSuggestion, getTopicSuggestions, etc.)
