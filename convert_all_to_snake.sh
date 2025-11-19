#!/bin/bash

# Files to convert
FILES="server/routers.ts server/db.ts"

for file in $FILES; do
  echo "Converting $file..."
  
  # User fields
  sed -i 's/\.openId/\.open_id/g' "$file"
  sed -i 's/openId:/open_id:/g' "$file"
  sed -i 's/\.loginMethod/\.login_method/g' "$file"
  sed -i 's/loginMethod:/login_method:/g' "$file"
  sed -i 's/\.preferredLanguage/\.preferred_language/g' "$file"
  sed -i 's/preferredLanguage:/preferred_language:/g' "$file"
  sed -i 's/\.totalExamsCompleted/\.total_exams_completed/g' "$file"
  sed -i 's/totalExamsCompleted:/total_exams_completed:/g' "$file"
  sed -i 's/\.totalVocabularyLearned/\.total_vocabulary_learned/g' "$file"
  sed -i 's/totalVocabularyLearned:/total_vocabulary_learned:/g' "$file"
  sed -i 's/\.totalTimeSpentMinutes/\.total_time_spent_minutes/g' "$file"
  sed -i 's/totalTimeSpentMinutes:/total_time_spent_minutes:/g' "$file"
  sed -i 's/\.currentStreak/\.current_streak/g' "$file"
  sed -i 's/currentStreak:/current_streak:/g' "$file"
  sed -i 's/\.longestStreak/\.longest_streak/g' "$file"
  sed -i 's/longestStreak:/longest_streak:/g' "$file"
  sed -i 's/\.lastActivityDate/\.last_activity_date/g' "$file"
  sed -i 's/lastActivityDate:/last_activity_date:/g' "$file"
  sed -i 's/\.createdAt/\.created_at/g' "$file"
  sed -i 's/createdAt:/created_at:/g' "$file"
  sed -i 's/\.updatedAt/\.updated_at/g' "$file"
  sed -i 's/updatedAt:/updated_at:/g' "$file"
  sed -i 's/\.lastSignedIn/\.last_signed_in/g' "$file"
  sed -i 's/lastSignedIn:/last_signed_in:/g' "$file"
  
  # Common fields
  sed -i 's/\.textId/\.text_id/g' "$file"
  sed -i 's/textId:/text_id:/g' "$file"
  sed -i 's/\.userId/\.user_id/g' "$file"
  sed -i 's/userId:/user_id:/g' "$file"
  sed -i 's/\.examDate/\.exam_date/g' "$file"
  sed -i 's/examDate:/exam_date:/g' "$file"
  sed -i 's/\.timeSpentMinutes/\.time_spent_minutes/g' "$file"
  sed -i 's/timeSpentMinutes:/time_spent_minutes:/g' "$file"
  
  # Vocabulary fields
  sed -i 's/\.vocabularyId/\.vocabulary_id/g' "$file"
  sed -i 's/vocabularyId:/vocabulary_id:/g' "$file"
  sed -i 's/\.masteryLevel/\.mastery_level/g' "$file"
  sed -i 's/masteryLevel:/mastery_level:/g' "$file"
  sed -i 's/\.lastReviewedAt/\.last_reviewed_at/g' "$file"
  sed -i 's/lastReviewedAt:/last_reviewed_at:/g' "$file"
  sed -i 's/\.easeFactor/\.ease_factor/g' "$file"
  sed -i 's/easeFactor:/ease_factor:/g' "$file"
  sed -i 's/\.nextReviewAt/\.next_review_at/g' "$file"
  sed -i 's/nextReviewAt:/next_review_at:/g' "$file"
  
  # Report fields
  sed -i 's/\.reportedBy/\.reported_by/g' "$file"
  sed -i 's/reportedBy:/reported_by:/g' "$file"
  sed -i 's/\.reportType/\.report_type/g' "$file"
  sed -i 's/reportType:/report_type:/g' "$file"
  sed -i 's/\.levelIssueType/\.level_issue_type/g' "$file"
  sed -i 's/levelIssueType:/level_issue_type:/g' "$file"
  sed -i 's/\.contentIssueType/\.content_issue_type/g' "$file"
  sed -i 's/contentIssueType:/content_issue_type:/g' "$file"
  sed -i 's/\.reviewedBy/\.reviewed_by/g' "$file"
  sed -i 's/reviewedBy:/reviewed_by:/g' "$file"
  sed -i 's/\.reviewNote/\.review_note/g' "$file"
  sed -i 's/reviewNote:/review_note:/g' "$file"
  sed -i 's/\.reviewedAt/\.reviewed_at/g' "$file"
  sed -i 's/reviewedAt:/reviewed_at:/g' "$file"
  
  # Other fields
  sed -i 's/\.minHashSignature/\.min_hash_signature/g' "$file"
  sed -i 's/minHashSignature:/min_hash_signature:/g' "$file"
  sed -i 's/\.sourceLanguage/\.source_language/g' "$file"
  sed -i 's/sourceLanguage:/source_language:/g' "$file"
  sed -i 's/\.targetLanguage/\.target_language/g' "$file"
  sed -i 's/targetLanguage:/target_language:/g' "$file"
  sed -i 's/\.translatedText/\.translated_text/g' "$file"
  sed -i 's/translatedText:/translated_text:/g' "$file"
done

echo "Conversion complete!"
