import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

const database = await getDb();
import { 
  forumWarnings,
  forumModeratorNotes,
  forumReports,
  forumTopics,
  forumPosts,
  forumModerators,
  forumModerationActions,
  users
} from "../../drizzle/schema";
import { eq, desc, and, sql, gte, count } from "drizzle-orm";

// Moderator or Admin procedure
const moderatorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Check if user is admin or moderator
  const isModerator = await database
    .select()
    .from(forumModerators)
    .where(eq(forumModerators.user_id, ctx.user.id))
    .limit(1);
  
  if (ctx.user.role !== "admin" && isModerator.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Moderator access required" });
  }
  
  return next({ ctx });
});

export const forumModerationEnhancementsRouter = router({
  // Add warning to user
  addWarning: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      reason: z.string().min(10),
      severity: z.enum(["low", "medium", "high"]),
      topicId: z.number().optional(),
      postId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Add warning
      await database.insert(forumWarnings).values({
        user_id: input.userId,
        moderator_id: ctx.user.id,
        reason: input.reason,
        severity: input.severity,
        topic_id: input.topicId,
        post_id: input.postId,
      });
      
      // Log moderation action
      await database.insert(forumModerationActions).values({
        action_type: "warn",
        moderator_id: ctx.user.id,
        target_user_id: input.userId,
        reason: input.reason,
        topic_id: input.topicId,
        post_id: input.postId,
      });
      
      return { success: true };
    }),
  
  // Get user warnings
  getUserWarnings: moderatorProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const warnings = await database
        .select({
          id: forumWarnings.id,
          reason: forumWarnings.reason,
          severity: forumWarnings.severity,
          moderator_name: users.name,
          created_at: forumWarnings.created_at,
        })
        .from(forumWarnings)
        .leftJoin(users, eq(forumWarnings.moderator_id, users.id))
        .where(eq(forumWarnings.user_id, input.userId))
        .orderBy(desc(forumWarnings.created_at));
      
      return warnings;
    }),
  
  // Add moderator note
  addModeratorNote: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      note: z.string().min(5),
    }))
    .mutation(async ({ ctx, input }) => {
      await database.insert(forumModeratorNotes).values({
        user_id: input.userId,
        moderator_id: ctx.user.id,
        note: input.note,
      });
      
      return { success: true };
    }),
  
  // Get moderator notes for user
  getModeratorNotes: moderatorProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const notes = await database
        .select({
          id: forumModeratorNotes.id,
          note: forumModeratorNotes.note,
          moderator_name: users.name,
          created_at: forumModeratorNotes.created_at,
        })
        .from(forumModeratorNotes)
        .leftJoin(users, eq(forumModeratorNotes.moderator_id, users.id))
        .where(eq(forumModeratorNotes.user_id, input.userId))
        .orderBy(desc(forumModeratorNotes.created_at));
      
      return notes;
    }),
  
  // Get moderation statistics
  getModerationStats: moderatorProcedure
    .input(z.object({
      period: z.enum(["day", "week", "month", "all"]).default("week"),
    }))
    .query(async ({ input }) => {
      // Calculate date range
      let dateFilter;
      const now = new Date();
      
      switch (input.period) {
        case "day":
          dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(0); // All time
      }
      
      // Get pending reports count
      const [pendingReports] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(forumReports)
        .where(eq(forumReports.status, "pending"));
      
      // Get resolved reports count (in period)
      const [resolvedReports] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(forumReports)
        .where(
          and(
            eq(forumReports.status, "resolved"),
            gte(forumReports.resolved_at!, dateFilter)
          )
        );
      
      // Get total reports (in period)
      const [totalReports] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(forumReports)
        .where(gte(forumReports.created_at, dateFilter));
      
      // Get reports by reason
      const reportsByReason = await database
        .select({
          reason: forumReports.reason,
          count: sql<number>`count(*)::int`,
        })
        .from(forumReports)
        .where(gte(forumReports.created_at, dateFilter))
        .groupBy(forumReports.reason)
        .orderBy(desc(sql`count(*)`));
      
      // Get most reported users
      const mostReportedUsers = await database
        .select({
          user_id: forumTopics.user_id,
          user_name: users.name,
          report_count: sql<number>`count(*)::int`,
        })
        .from(forumReports)
        .leftJoin(forumTopics, eq(forumReports.topic_id, forumTopics.id))
        .leftJoin(users, eq(forumTopics.user_id, users.id))
        .where(
          and(
            gte(forumReports.created_at, dateFilter),
            sql`${forumTopics.user_id} IS NOT NULL`
          )
        )
        .groupBy(forumTopics.user_id, users.name)
        .orderBy(desc(sql`count(*)`))
        .limit(10);
      
      // Get moderator activity
      const moderatorActivity = await database
        .select({
          moderator_id: forumModerationActions.moderator_id,
          moderator_name: users.name,
          action_count: sql<number>`count(*)::int`,
        })
        .from(forumModerationActions)
        .leftJoin(users, eq(forumModerationActions.moderator_id, users.id))
        .where(gte(forumModerationActions.created_at, dateFilter))
        .groupBy(forumModerationActions.moderator_id, users.name)
        .orderBy(desc(sql`count(*)`));
      
      // Get actions by type
      const actionsByType = await database
        .select({
          action_type: forumModerationActions.action_type,
          count: sql<number>`count(*)::int`,
        })
        .from(forumModerationActions)
        .where(gte(forumModerationActions.created_at, dateFilter))
        .groupBy(forumModerationActions.action_type)
        .orderBy(desc(sql`count(*)`));
      
      return {
        pendingReports: pendingReports.count,
        resolvedReports: resolvedReports.count,
        totalReports: totalReports.count,
        reportsByReason,
        mostReportedUsers,
        moderatorActivity,
        actionsByType,
      };
    }),
  
  // Quick action: Delete content and ban user
  deleteAndBan: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      topicId: z.number().optional(),
      postId: z.number().optional(),
      banReason: z.string().min(10),
      banDuration: z.enum(["1day", "1week", "1month", "permanent"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Delete content
      if (input.topicId) {
        await database.delete(forumTopics).where(eq(forumTopics.id, input.topicId));
      } else if (input.postId) {
        await database.delete(forumPosts).where(eq(forumPosts.id, input.postId));
      }
      
      // Ban user
      let bannedUntil = null;
      if (input.banDuration !== "permanent") {
        const duration = {
          "1day": 1,
          "1week": 7,
          "1month": 30,
        }[input.banDuration];
        bannedUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      }
      
      await database
        .update(users)
        .set({
          is_banned: true,
          banned_at: new Date(),
          banned_by: ctx.user.id,
          ban_reason: input.banReason,
          banned_until: bannedUntil,
        })
        .where(eq(users.id, input.userId));
      
      // Log actions
      await database.insert(forumModerationActions).values([
        {
          action_type: input.topicId ? "delete_topic" : "delete_post",
          moderator_id: ctx.user.id,
          target_user_id: input.userId,
          topic_id: input.topicId,
          post_id: input.postId,
          reason: input.banReason,
        },
        {
          action_type: "ban",
          moderator_id: ctx.user.id,
          target_user_id: input.userId,
          reason: input.banReason,
          ban_duration: input.banDuration,
        },
      ]);
      
      return { success: true };
    }),
  
  // Quick action: Hide content and warn user
  hideAndWarn: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      topicId: z.number().optional(),
      postId: z.number().optional(),
      warnReason: z.string().min(10),
      severity: z.enum(["low", "medium", "high"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Hide content
      if (input.topicId) {
        await database
          .update(forumTopics)
          .set({ is_hidden: true })
          .where(eq(forumTopics.id, input.topicId));
      } else if (input.postId) {
        await database
          .update(forumPosts)
          .set({ is_hidden: true })
          .where(eq(forumPosts.id, input.postId));
      }
      
      // Add warning
      await database.insert(forumWarnings).values({
        user_id: input.userId,
        moderator_id: ctx.user.id,
        reason: input.warnReason,
        severity: input.severity,
        topic_id: input.topicId,
        post_id: input.postId,
      });
      
      // Log actions
      await database.insert(forumModerationActions).values([
        {
          action_type: input.topicId ? "hide_topic" : "hide_post",
          moderator_id: ctx.user.id,
          target_user_id: input.userId,
          topic_id: input.topicId,
          post_id: input.postId,
          reason: input.warnReason,
        },
        {
          action_type: "warn",
          moderator_id: ctx.user.id,
          target_user_id: input.userId,
          reason: input.warnReason,
        },
      ]);
      
      return { success: true };
    }),
});
