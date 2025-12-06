# Changes Made - Local Development Setup & Bug Fixes

## Files Modified

### 1. `.env`
**Changes:**
- Updated `GOOGLE_REDIRECT_URI` from Railway production URL to `http://localhost:3000/auth/callback`
- Added `VITE_APP_TITLE="Dutch B1 Exam Generator"`
- Set `DISABLE_AUTH="true"` for local development

**Reason:** Enable local development without OAuth configuration

### 2. `server/routers.ts` (Line 810)
**Changes:**
- Removed `last_reviewed_at: null` from `createUserVocabulary` call in `saveWordFromText` mutation

**Before:**
```typescript
await db.createUserVocabulary({
  user_id: ctx.user.id,
  vocabulary_id: vocabEntry.id,
  status: "new",
  correct_count: 0,
  incorrect_count: 0,
  last_reviewed_at: null,  // ❌ Causes 500 error
  next_review_at: new Date(),
  ease_factor: 2500,
  interval: 0,
  repetitions: 0,
});
```

**After:**
```typescript
await db.createUserVocabulary({
  user_id: ctx.user.id,
  vocabulary_id: vocabEntry.id,
  status: "new",
  correct_count: 0,
  incorrect_count: 0,
  // ✅ Removed last_reviewed_at - will be NULL by default
  next_review_at: new Date(),
  ease_factor: 2500,
  interval: 0,
  repetitions: 0,
});
```

**Reason:** Fix 500 error when saving vocabulary words. Drizzle ORM doesn't handle explicit `null` values correctly for nullable fields.

## Bug Fixed

### Issue: Vocabulary Save Error (500 Internal Server Error)
**Symptom:** When double-clicking a word to save it to personal vocabulary, the request failed with:
```
Failed query: insert into "user_vocabulary" 
params: 999,3,new,0,0,,2025-11-21T18:06:35.466Z,2500,0,0
                      ^^
                      Empty null value causing error
```

**Root Cause:** Passing `last_reviewed_at: null` explicitly causes Drizzle ORM to try inserting `default` keyword in SQL, which fails.

**Solution:** Remove the field from the object entirely. For nullable fields without defaults, omitting them results in proper NULL insertion.

## Testing Results

✅ Application runs successfully on `http://localhost:3000`
✅ Homepage loads correctly with proper title
✅ Public exams page displays exams
✅ Exam page shows text and questions
✅ Progress page displays statistics
✅ Vocabulary page accessible
✅ Authentication disabled for local development

## Notes

- Old texts in production database (e.g., text_id 56) don't have vocabulary entries
- This means no interactive words appear in those exams
- Consider creating a backfill script to extract vocabulary for existing texts

## Commit Message Suggestion

```
fix: resolve vocabulary save error and setup local development

- Fix 500 error when saving words to vocabulary by removing explicit null
- Update .env for local development (redirect URI, auth disabled)
- Add comprehensive analysis documentation

Closes #[issue-number]
```
