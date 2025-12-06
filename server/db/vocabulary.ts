// Vocabulary-related database functions
import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import { vocabulary, textVocabulary, InsertVocabulary } from "../../drizzle/schema";

export async function createVocabulary(vocab: InsertVocabulary) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(vocabulary).values(vocab).returning();
    return result;
}

/**
 * Find vocabulary by word and context (for shared vocabulary system)
 */
export async function findVocabularyByWordAndContext(dutchWord: string, context: string) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select()
        .from(vocabulary)
        .where(and(
            eq(vocabulary.dutchWord, dutchWord),
            eq(vocabulary.context, context)
        ))
        .limit(1);

    return result[0] || null;
}

/**
 * Link vocabulary to text (many-to-many relationship)
 */
export async function linkVocabularyToText(textId: number, vocabularyId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(textVocabulary).values({
        text_id: textId,
        vocabulary_id: vocabularyId,
    }).onConflictDoNothing();

    return result;
}

export async function getVocabularyByTextId(text_id: number) {
    const db = await getDb();
    if (!db) return [];

    const result = await db
        .select({
            id: vocabulary.id,
            dutchWord: vocabulary.dutchWord,
            context: vocabulary.context,
            dutchDefinition: vocabulary.dutchDefinition,
            wordType: vocabulary.wordType,
            arabicTranslation: vocabulary.arabicTranslation,
            englishTranslation: vocabulary.englishTranslation,
            turkishTranslation: vocabulary.turkishTranslation,
            exampleSentence: vocabulary.exampleSentence,
            difficulty: vocabulary.difficulty,
            audioUrl: vocabulary.audioUrl,
            created_at: vocabulary.created_at,
        })
        .from(textVocabulary)
        .innerJoin(vocabulary, eq(textVocabulary.vocabulary_id, vocabulary.id))
        .where(eq(textVocabulary.text_id, text_id));

    return result;
}

export async function getVocabularyById(id: number) {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db
        .select()
        .from(vocabulary)
        .where(eq(vocabulary.id, id))
        .limit(1);
    return result.length > 0 ? result[0] : undefined;
}

export async function updateVocabularyAudio(vocabId: number, audioUrl: string, audioKey: string) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(vocabulary)
        .set({ audioUrl, audioKey, updated_at: new Date() })
        .where(eq(vocabulary.id, vocabId));
}

export async function updateVocabulary(vocabId: number, data: Partial<typeof vocabulary.$inferInsert>) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(vocabulary)
        .set({ ...data, updated_at: new Date() })
        .where(eq(vocabulary.id, vocabId));
}
