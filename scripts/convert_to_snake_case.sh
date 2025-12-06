#!/bin/bash
# Convert camelCase to snake_case in schema.ts

sed -i 's/openId/open_id/g' drizzle/schema.ts
sed -i 's/loginMethod/login_method/g' drizzle/schema.ts
sed -i 's/preferredLanguage/preferred_language/g' drizzle/schema.ts
sed -i 's/totalExamsCompleted/total_exams_completed/g' drizzle/schema.ts
sed -i 's/totalVocabularyLearned/total_vocabulary_learned/g' drizzle/schema.ts
sed -i 's/totalTimeSpentMinutes/total_time_spent_minutes/g' drizzle/schema.ts
sed -i 's/currentStreak/current_streak/g' drizzle/schema.ts
sed -i 's/longestStreak/longest_streak/g' drizzle/schema.ts
sed -i 's/lastActivityDate/last_activity_date/g' drizzle/schema.ts
sed -i 's/createdAt/created_at/g' drizzle/schema.ts
sed -i 's/updatedAt/updated_at/g' drizzle/schema.ts
sed -i 's/lastSignedIn/last_signed_in/g' drizzle/schema.ts
sed -i 's/textId/text_id/g' drizzle/schema.ts
sed -i 's/userId/user_id/g' drizzle/schema.ts
sed -i 's/examDate/exam_date/g' drizzle/schema.ts
sed -i 's/timeSpentMinutes/time_spent_minutes/g' drizzle/schema.ts
sed -i 's/vocabularyId/vocabulary_id/g' drizzle/schema.ts
sed -i 's/masteryLevel/mastery_level/g' drizzle/schema.ts
sed -i 's/lastReviewedAt/last_reviewed_at/g' drizzle/schema.ts
sed -i 's/easeFactor/ease_factor/g' drizzle/schema.ts
sed -i 's/nextReviewAt/next_review_at/g' drizzle/schema.ts
sed -i 's/reportedBy/reported_by/g' drizzle/schema.ts
sed -i 's/reportType/report_type/g' drizzle/schema.ts
sed -i 's/levelIssueType/level_issue_type/g' drizzle/schema.ts
sed -i 's/contentIssueType/content_issue_type/g' drizzle/schema.ts
sed -i 's/reviewedBy/reviewed_by/g' drizzle/schema.ts
sed -i 's/reviewNote/review_note/g' drizzle/schema.ts
sed -i 's/reviewedAt/reviewed_at/g' drizzle/schema.ts
sed -i 's/minHashSignature/min_hash_signature/g' drizzle/schema.ts
sed -i 's/sourceLanguage/source_language/g' drizzle/schema.ts
sed -i 's/targetLanguage/target_language/g' drizzle/schema.ts
sed -i 's/translatedText/translated_text/g' drizzle/schema.ts

echo "Schema converted to snake_case"
