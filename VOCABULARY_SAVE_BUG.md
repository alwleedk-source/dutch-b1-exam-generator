# Vocabulary Save Bug - Analysis and Fix

## 🐛 Bug Description

When users double-click on an interactive word in an exam to save it to their vocabulary, the application returns a **500 Internal Server Error**.

## 🔍 Root Cause

The issue is in the `createUserVocabulary` function in `server/db.ts`. When using Drizzle ORM's `.insert().values()` method, it automatically tries to insert `default` for columns that have `.default()` or `.defaultNow()` in the schema, even when we don't pass them.

### Original Error SQL:
```sql
insert into "user_vocabulary" (
  "id", "user_id", "vocabulary_id", "status", "correct_count", "incorrect_count", 
  "last_reviewed_at", "next_review_at", "ease_factor", "interval", "repetitions", 
  "created_at", "updated_at"
) values (
  default, $1, $2, $3, $4, $5, default, $6, $7, $8, $9, default, default
)
```

**Problem**: PostgreSQL doesn't accept explicit `default` keyword in this context for `last_reviewed_at` (which is nullable without a default value).

## ✅ Solution Implemented

Changed `createUserVocabulary` to use **raw SQL** instead of Drizzle's ORM methods:

```typescript
export async function createUserVocabulary(userVocab: InsertUserVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use raw SQL to avoid Drizzle inserting 'default' for last_reviewed_at
  const nextReviewDate = userVocab.next_review_at instanceof Date 
    ? userVocab.next_review_at.toISOString() 
    : userVocab.next_review_at;
    
  const result = await db.execute(sql`
    INSERT INTO "user_vocabulary" (
      "user_id", "vocabulary_id", "status", "correct_count", "incorrect_count",
      "next_review_at", "ease_factor", "interval", "repetitions"
    ) VALUES (
      ${userVocab.user_id}, ${userVocab.vocabulary_id}, ${userVocab.status}, 
      ${userVocab.correct_count}, ${userVocab.incorrect_count},
      ${nextReviewDate}, ${userVocab.ease_factor}, 
      ${userVocab.interval}, ${userVocab.repetitions}
    )
  `);
  return result;
}
```

### Key Changes:
1. ✅ Use `sql` template literal for raw SQL query
2. ✅ Only insert fields we actually need (exclude `last_reviewed_at`, `created_at`, `updated_at`, `id`)
3. ✅ Convert JavaScript Date to ISO string for PostgreSQL compatibility
4. ✅ Let PostgreSQL handle default values for `id`, `created_at`, and `updated_at`
5. ✅ Leave `last_reviewed_at` as NULL (not inserted)

## 📝 Files Modified

- `server/db.ts` - Fixed `createUserVocabulary` function
- `server/routers.ts` - Already correct (no `last_reviewed_at` passed)

## 🧪 Testing Required

1. Double-click on an interactive word in an exam
2. Verify word is saved to user's vocabulary
3. Check vocabulary page to see the saved word
4. Verify no 500 errors in console

## 🔄 Status

**IN PROGRESS** - Fix implemented, needs testing after clean server restart
