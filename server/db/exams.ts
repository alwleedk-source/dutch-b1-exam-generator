// Exam-related database functions
import { eq, and, desc, sql, gte, ilike, or } from "drizzle-orm";
import { getDb } from "./connection";
import { exams, texts, users, InsertExam } from "../../drizzle/schema";

export async function createExam(exam: InsertExam) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.insert(exams).values(exam).returning();
    return result;
}

export async function getExamById(id: number) {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db
        .select({
            id: exams.id,
            user_id: exams.user_id,
            text_id: exams.text_id,
            questions: exams.questions,
            answers: exams.answers,
            total_questions: exams.total_questions,
            correct_answers: exams.correct_answers,
            score_percentage: exams.score_percentage,
            started_at: exams.started_at,
            completed_at: exams.completed_at,
            time_spent_minutes: exams.time_spent_minutes,
            status: exams.status,
            created_at: exams.created_at,
            updated_at: exams.updated_at,
            title: texts.title,
            dutch_text: texts.dutch_text,
        })
        .from(exams)
        .leftJoin(texts, eq(exams.text_id, texts.id))
        .where(eq(exams.id, id))
        .limit(1);

    return result.length > 0 ? result[0] : undefined;
}

export async function getExamsByUser(user_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select({
            id: exams.id,
            user_id: exams.user_id,
            text_id: exams.text_id,
            questions: exams.questions,
            answers: exams.answers,
            total_questions: exams.total_questions,
            correct_answers: exams.correct_answers,
            score_percentage: exams.score_percentage,
            staatsexamen_score: exams.staatsexamen_score,
            started_at: exams.started_at,
            completed_at: exams.completed_at,
            time_spent_minutes: exams.time_spent_minutes,
            exam_mode: exams.exam_mode,
            time_limit_minutes: exams.time_limit_minutes,
            timer_paused_at: exams.timer_paused_at,
            status: exams.status,
            created_at: exams.created_at,
            updated_at: exams.updated_at,
            title: texts.title,
            dutch_text: texts.dutch_text,
        })
        .from(exams)
        .leftJoin(texts, eq(exams.text_id, texts.id))
        .where(eq(exams.user_id, user_id))
        .orderBy(desc(exams.created_at));
}

export async function getCompletedExamsByUser(user_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(exams)
        .where(and(eq(exams.user_id, user_id), eq(exams.status, "completed")))
        .orderBy(desc(exams.completed_at));
}

export async function getExamsByTextId(text_id: number) {
    const db = await getDb();
    if (!db) return [];

    return await db
        .select()
        .from(exams)
        .where(eq(exams.text_id, text_id))
        .limit(1);
}

export async function updateExam(
    examId: number,
    updates: {
        answers?: string;
        correct_answers?: number;
        score_percentage?: number;
        staatsexamen_score?: number;
        performance_analysis?: string;
        recommendations?: string;
        skill_analysis?: string;
        completed_at?: Date;
        time_spent_minutes?: number;
        status?: "in_progress" | "completed" | "abandoned";
    }
) {
    const db = await getDb();
    if (!db) return;

    await db
        .update(exams)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(exams.id, examId));
}

export async function getUserExamStats(user_id: number) {
    const db = await getDb();
    if (!db) return null;

    const result = await db
        .select({
            totalExams: sql<number>`COUNT(*)`,
            completedExams: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN 1 ELSE 0 END)`,
            averageScore: sql<number>`AVG(CASE WHEN ${exams.status} = 'completed' THEN ${exams.score_percentage} ELSE NULL END)`,
            totalTimeMinutes: sql<number>`SUM(CASE WHEN ${exams.status} = 'completed' THEN ${exams.time_spent_minutes} ELSE 0 END)`,
        })
        .from(exams)
        .where(eq(exams.user_id, user_id));

    return result.length > 0 ? result[0] : null;
}

export async function getAllExams(options?: {
    search?: string;
    status?: "all" | "in_progress" | "completed";
    limit?: number;
    offset?: number;
}) {
    const db = await getDb();
    if (!db) return [];

    const { search, status, limit = 50, offset = 0 } = options || {};

    let query = db
        .select({
            id: exams.id,
            user_id: exams.user_id,
            text_id: exams.text_id,
            questions: exams.questions,
            answers: exams.answers,
            total_questions: exams.total_questions,
            correct_answers: exams.correct_answers,
            score_percentage: exams.score_percentage,
            staatsexamen_score: exams.staatsexamen_score,
            started_at: exams.started_at,
            completed_at: exams.completed_at,
            time_spent_minutes: exams.time_spent_minutes,
            exam_mode: exams.exam_mode,
            status: exams.status,
            created_at: exams.created_at,
            userName: users.name,
            userEmail: users.email,
            textTitle: texts.title,
        })
        .from(exams)
        .leftJoin(users, eq(exams.user_id, users.id))
        .leftJoin(texts, eq(exams.text_id, texts.id))
        .orderBy(desc(exams.created_at))
        .limit(limit)
        .offset(offset);

    const conditions = [];

    if (status && status !== "all") {
        conditions.push(eq(exams.status, status));
    }

    if (search) {
        conditions.push(
            or(
                ilike(users.name, `%${search}%`),
                ilike(users.email, `%${search}%`),
                ilike(texts.title, `%${search}%`)
            )
        );
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
    }

    return await query;
}

export async function deleteExam(examId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(exams).where(eq(exams.id, examId));
}

export async function deleteOldIncompleteExams(olderThan: Date) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
        .delete(exams)
        .where(
            and(
                eq(exams.status, "in_progress"),
                or(
                    sql`${exams.completed_at} IS NULL`,
                    sql`${exams.completed_at} < ${olderThan}`
                ),
                sql`${exams.created_at} < ${olderThan}`
            )
        )
        .returning({ id: exams.id });

    return result.length;
}
