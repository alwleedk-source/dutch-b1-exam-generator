// Translation-related database functions
import { eq } from "drizzle-orm";
import { getDb } from "./connection";
import { translations, InsertTranslation } from "../../drizzle/schema";

export async function createTranslation(translation: InsertTranslation) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(translations).values(translation);
    return result;
}

export async function getTranslationByTextId(text_id: number) {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db
        .select()
        .from(translations)
        .where(eq(translations.text_id, text_id))
        .limit(1);
    return result.length > 0 ? result[0] : undefined;
}

export async function updateTranslation(
    text_id: number,
    updates: {
        arabicTranslation?: string;
        englishTranslation?: string;
        turkishTranslation?: string;
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(translations)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(translations.text_id, text_id));
}
