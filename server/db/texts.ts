// Text-related database functions
import { eq, and, desc, gte } from "drizzle-orm";
import { getDb } from "./connection";
import { texts, InsertText } from "../../drizzle/schema";

export async function createText(text: InsertText) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(texts).values(text).returning();
    return result;
}

export async function checkDuplicateText(minHashSignature: number[], userId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const minHashSignatureJson = JSON.stringify(minHashSignature);

    const result = await db
        .select()
        .from(texts)
        .where(
            and(
                eq(texts.min_hash_signature, minHashSignatureJson),
                eq(texts.created_by, userId)
            )
        )
        .limit(1);

    return result.length > 0;
}

export async function getTextById(id: number) {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db.select().from(texts).where(eq(texts.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
}

export async function getTextsByUser(user_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(texts)
        .where(eq(texts.created_by, user_id))
        .orderBy(desc(texts.created_at));
}

export async function getUserTextsCreatedAfter(user_id: number, date: Date) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(texts)
        .where(and(eq(texts.created_by, user_id), gte(texts.created_at, date)))
        .orderBy(desc(texts.created_at));
}

export async function getApprovedTexts() {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(texts)
        .where(eq(texts.status, "approved"))
        .orderBy(desc(texts.created_at));
}

export async function getPendingTexts() {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(texts)
        .where(eq(texts.status, "pending"))
        .orderBy(desc(texts.created_at));
}

export async function updateTextStatus(
    text_id: number,
    status: "pending" | "approved" | "rejected",
    moderated_by: number,
    moderation_note?: string
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(texts)
        .set({
            status,
            moderated_by,
            moderation_note,
            moderated_at: new Date(),
            updated_at: new Date(),
        })
        .where(eq(texts.id, text_id));
}

export async function updateTextValidation(
    text_id: number,
    validation: {
        is_valid_dutch: boolean;
        detectedLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
        levelConfidence?: number;
        is_b1_level: boolean;
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(texts)
        .set({ ...validation, updated_at: new Date() })
        .where(eq(texts.id, text_id));
}

export async function getAllTexts() {
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(texts).orderBy(desc(texts.created_at));
}

export async function deleteText(textId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(texts).where(eq(texts.id, textId));
}
