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

// Re-export translation functions
export {
    createTranslation,
    getTranslationByTextId,
    updateTranslation,
} from "./translations";

// Re-export vocabulary functions
export {
    createVocabulary,
    findVocabularyByWordAndContext,
    linkVocabularyToText,
    getVocabularyByTextId,
    getVocabularyById,
    updateVocabularyAudio,
    updateVocabulary,
} from "./vocabulary";

// Re-export user vocabulary functions (SRS)
export {
    updateUserVocabularyCount,
    updateUserStreak,
    createUserVocabulary,
    getUserVocabularyByVocabId,
    getUserVocabularyCount,
    getUserVocabularyProgress,
    updateUserVocabularyProgress,
    getUserVocabularyById,
    updateUserVocabularySRS,
    deleteUserVocabulary,
    updateUserVocabularyStatus,
} from "./userVocabulary";

// Re-export report functions
export {
    createReport,
    getReportsByTextId,
    getPendingReports,
    updateReportStatus,
} from "./reports";

// Re-export achievement functions
export {
    createAchievement,
    getUserAchievements,
    updateAchievementProgress,
} from "./achievements";

// Re-export leaderboard functions
export { getLeaderboard } from "./leaderboard";

// Re-export admin functions
export {
    getUserExams,
    getUserTexts,
    deleteUser,
    updateUserRole,
    updateUserBanStatus,
    getTextsFiltered,
    getTextWithDetails,
    getAdminStats,
    getRecentActivity,
    getDictionaryWord,
    searchDictionary,
    rateText,
    getUserRating,
    getTextRatings,
    deleteRating,
} from "./admin";
