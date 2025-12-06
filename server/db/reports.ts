// Report-related database functions
import { eq, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { reports, InsertReport } from "../../drizzle/schema";

export async function createReport(report: InsertReport) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(reports).values(report);
    return result;
}

export async function getReportsByTextId(text_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(reports)
        .where(eq(reports.text_id, text_id))
        .orderBy(desc(reports.created_at));
}

export async function getPendingReports() {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(reports)
        .where(eq(reports.status, "pending"))
        .orderBy(desc(reports.created_at));
}

export async function updateReportStatus(
    reportId: number,
    status: "pending" | "reviewed" | "resolved" | "dismissed",
    reviewed_by: number,
    reviewNote?: string
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(reports)
        .set({
            status,
            reviewed_by: reviewed_by,
            review_note: reviewNote,
            reviewed_at: new Date(),
            updated_at: new Date(),
        })
        .where(eq(reports.id, reportId));
}
