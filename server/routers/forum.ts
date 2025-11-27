import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

const database = await getDb();
import { 
  forumCategories, 
  forumTopics, 
  forumPosts, 
  forumVotes,
  forumNotifications,
  forumModerators,
  forumReports,
  forumRateLimits,
  users
} from "../../drizzle/schema";
import { eq, desc, and, sql, gte } from "drizzle-orm";

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

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Rate limiting helper
async function checkRateLimit(
  userId: number, 
  actionType: string, 
  maxActions: number, 
  windowMinutes: number
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  
  const limits = await database
    .select()
    .from(forumRateLimits)
    .where(
      and(
        eq(forumRateLimits.user_id, userId),
        eq(forumRateLimits.action_type, actionType),
        gte(forumRateLimits.window_start, windowStart)
      )
    );
  
  const totalActions = limits.reduce((sum, limit) => sum + limit.action_count, 0);
  
  if (totalActions >= maxActions) {
    return false; // Rate limit exceeded
  }
  
  // Record this action
  const windowEnd = new Date(Date.now() + windowMinutes * 60 * 1000);
  await database.insert(forumRateLimits).values({
    user_id: userId,
    action_type: actionType,
    action_count: 1,
    window_start: new Date(),
    window_end: windowEnd,
  });
  
  return true;
}

// Check if user is new (< 7 days)
function isNewUser(createdAt: Date): boolean {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return createdAt > sevenDaysAgo;
}

// Check if post/topic can be edited (within 5 minutes)
function canEditOrDelete(createdAt: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return createdAt > fiveMinutesAgo;
}

export const forumRouter = router({
  // Get all categories
  getCategories: publicProcedure.query(async () => {
    return await database
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.is_active, true))
      .orderBy(forumCategories.sort_order);
  }),

  // Get topics by category
  getTopicsByCategory: publicProcedure
    .input(z.object({
      categoryId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;
      
      const topics = await database
        .select({
          id: forumTopics.id,
          title: forumTopics.title,
          content: forumTopics.content,
          user_id: forumTopics.user_id,
          user_name: users.name,
          is_pinned: forumTopics.is_pinned,
          is_locked: forumTopics.is_locked,
          is_hidden: forumTopics.is_hidden,
          view_count: forumTopics.view_count,
          reply_count: forumTopics.reply_count,
          upvote_count: forumTopics.upvote_count,
          last_post_at: forumTopics.last_post_at,
          created_at: forumTopics.created_at,
        })
        .from(forumTopics)
        .leftJoin(users, eq(forumTopics.user_id, users.id))
        .where(
          and(
            eq(forumTopics.category_id, input.categoryId),
            // Show hidden topics to moderators and admins
            ctx.user && (ctx.user.role === "moderator" || ctx.user.role === "admin")
              ? undefined
              : eq(forumTopics.is_hidden, false)
          )
        )
        .orderBy(desc(forumTopics.is_pinned), desc(forumTopics.last_post_at))
        .limit(input.limit)
        .offset(offset);
      
      return topics;
    }),

  // Get single topic with posts
  getTopic: publicProcedure
    .input(z.object({
      topicId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Get topic
      const topic = await database
        .select({
          id: forumTopics.id,
          title: forumTopics.title,
          content: forumTopics.content,
          user_id: forumTopics.user_id,
          user_name: users.name,
          is_pinned: forumTopics.is_pinned,
          is_locked: forumTopics.is_locked,
          is_hidden: forumTopics.is_hidden,
          view_count: forumTopics.view_count,
          reply_count: forumTopics.reply_count,
          upvote_count: forumTopics.upvote_count,
          created_at: forumTopics.created_at,
        })
        .from(forumTopics)
        .leftJoin(users, eq(forumTopics.user_id, users.id))
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      // Check if topic is hidden and user is not moderator/admin
      if (topic[0].is_hidden && (!ctx.user || (ctx.user.role !== "moderator" && ctx.user.role !== "admin"))) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      // Increment view count
      await database
        .update(forumTopics)
        .set({ view_count: sql`${forumTopics.view_count} + 1` })
        .where(eq(forumTopics.id, input.topicId));
      
      // Get posts
      const offset = (input.page - 1) * input.limit;
      const posts = await database
        .select({
          id: forumPosts.id,
          content: forumPosts.content,
          user_id: forumPosts.user_id,
          user_name: users.name,
          upvote_count: forumPosts.upvote_count,
          created_at: forumPosts.created_at,
        })
        .from(forumPosts)
        .leftJoin(users, eq(forumPosts.user_id, users.id))
        .where(
          and(
            eq(forumPosts.topic_id, input.topicId),
            // Show hidden posts to moderators and admins
            ctx.user && (ctx.user.role === "moderator" || ctx.user.role === "admin")
              ? undefined
              : eq(forumPosts.is_hidden, false)
          )
        )
        .orderBy(forumPosts.created_at)
        .limit(input.limit)
        .offset(offset);
      
      return {
        topic: topic[0],
        posts,
      };
    }),

  // Create new topic
  createTopic: protectedProcedure
    .input(z.object({
      categoryId: z.number(),
      title: z.string().min(5).max(255),
      content: z.string().min(20).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is banned
      if (ctx.user.is_banned) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: `You have been banned. Reason: ${ctx.user.ban_reason || "Violation of community guidelines"}` 
        });
      }
      
      // Check cooldown (2 minutes between topics)
      const lastTopic = await database
        .select({ created_at: forumTopics.created_at })
        .from(forumTopics)
        .where(eq(forumTopics.user_id, ctx.user.id))
        .orderBy(desc(forumTopics.created_at))
        .limit(1);
      
      if (lastTopic.length > 0) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (lastTopic[0].created_at > twoMinutesAgo) {
          const waitSeconds = Math.ceil((lastTopic[0].created_at.getTime() + 120000 - Date.now()) / 1000);
          throw new TRPCError({ 
            code: "TOO_MANY_REQUESTS", 
            message: `Please wait ${waitSeconds} seconds before creating another topic.` 
          });
        }
      }
      
      // Check rate limit
      const userCreatedAt = ctx.user.created_at || new Date();
      const isNew = isNewUser(userCreatedAt);
      const maxTopics = isNew ? 3 : 5;
      const windowMinutes = 60;
      
      const canCreate = await checkRateLimit(ctx.user.id, "create_topic", maxTopics, windowMinutes);
      if (!canCreate) {
        throw new TRPCError({ 
          code: "TOO_MANY_REQUESTS", 
          message: `Rate limit exceeded. You can create maximum ${maxTopics} topics per hour.` 
        });
      }
      
      // Validate content
      if (input.title.length < 5) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Topic title must be at least 5 characters long." 
        });
      }
      
      if (input.content.length < 20) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Topic content must be at least 20 characters long." 
        });
      }
      
      // Check for duplicate title in same category (last 24 hours)
      const duplicateTitle = await database
        .select()
        .from(forumTopics)
        .where(
          and(
            eq(forumTopics.category_id, input.categoryId),
            eq(forumTopics.title, input.title),
            gte(forumTopics.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        )
        .limit(1);
      
      if (duplicateTitle.length > 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "A topic with this title already exists in this category. Please use a different title." 
        });
      }
      
      // Create topic
      const [topic] = await database
        .insert(forumTopics)
        .values({
          category_id: input.categoryId,
          user_id: ctx.user.id,
          title: input.title,
          content: input.content,
          last_post_at: new Date(),
          last_post_user_id: ctx.user.id,
        })
        .returning();
      
      return topic;
    }),

  // Create post (reply)
  createPost: protectedProcedure
    .input(z.object({
      topicId: z.number(),
      content: z.string().min(10).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is banned
      if (ctx.user.is_banned) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: `You have been banned. Reason: ${ctx.user.ban_reason || "Violation of community guidelines"}` 
        });
      }
      
      // Check if topic exists and is not locked
      const topic = await database
        .select()
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      if (topic[0].is_locked) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This topic is locked" });
      }
      
      // Check cooldown (30 seconds between posts)
      const lastPost = await database
        .select({ created_at: forumPosts.created_at })
        .from(forumPosts)
        .where(eq(forumPosts.user_id, ctx.user.id))
        .orderBy(desc(forumPosts.created_at))
        .limit(1);
      
      if (lastPost.length > 0) {
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
        if (lastPost[0].created_at > thirtySecondsAgo) {
          const waitSeconds = Math.ceil((lastPost[0].created_at.getTime() + 30000 - Date.now()) / 1000);
          throw new TRPCError({ 
            code: "TOO_MANY_REQUESTS", 
            message: `Please wait ${waitSeconds} seconds before posting again.` 
          });
        }
      }
      
      // Check rate limit
      const userCreatedAt = ctx.user.created_at || new Date();
      const isNew = isNewUser(userCreatedAt);
      const maxPosts = isNew ? 10 : 20;
      const windowMinutes = 60;
      
      const canCreate = await checkRateLimit(ctx.user.id, "create_post", maxPosts, windowMinutes);
      if (!canCreate) {
        throw new TRPCError({ 
          code: "TOO_MANY_REQUESTS", 
          message: `Rate limit exceeded. You can create maximum ${maxPosts} posts per hour.` 
        });
      }
      
      // Validate content length
      if (input.content.length < 10) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Post content must be at least 10 characters long." 
        });
      }
      
      // Check for duplicate content (same content in last 5 minutes)
      const recentDuplicate = await database
        .select()
        .from(forumPosts)
        .where(
          and(
            eq(forumPosts.user_id, ctx.user.id),
            eq(forumPosts.content, input.content),
            gte(forumPosts.created_at, new Date(Date.now() - 5 * 60 * 1000))
          )
        )
        .limit(1);
      
      if (recentDuplicate.length > 0) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "You have already posted this exact content recently. Please avoid duplicate posts." 
        });
      }
      
      // Create post
      const [post] = await database
        .insert(forumPosts)
        .values({
          topic_id: input.topicId,
          user_id: ctx.user.id,
          content: input.content,
        })
        .returning();
      
      // Update topic stats
      await database
        .update(forumTopics)
        .set({
          reply_count: sql`${forumTopics.reply_count} + 1`,
          last_post_at: new Date(),
          last_post_user_id: ctx.user.id,
        })
        .where(eq(forumTopics.id, input.topicId));
      
      // Create notification for topic author
      if (topic[0].user_id !== ctx.user.id) {
        const { createNotification } = await import("./notifications");
        await createNotification({
          userId: topic[0].user_id,
          type: 'forum_reply',
          title: `${ctx.user.name || 'Someone'} replied to your topic`,
          message: input.content.substring(0, 100) + (input.content.length > 100 ? '...' : ''),
          actionUrl: `/forum/topic/${input.topicId}`,
          topicId: input.topicId,
          postId: post.id,
          fromUserId: ctx.user.id,
          priority: 'normal',
        });
      }
      
      return post;
    }),

  // Vote on topic or post
  vote: protectedProcedure
    .input(z.object({
      topicId: z.number().optional(),
      postId: z.number().optional(),
      voteType: z.enum(["upvote", "downvote"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!input.topicId && !input.postId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Either topicId or postId is required" });
      }
      
      // Check if already voted
      const existingVote = await database
        .select()
        .from(forumVotes)
        .where(
          and(
            eq(forumVotes.user_id, ctx.user.id),
            input.topicId ? eq(forumVotes.topic_id, input.topicId) : sql`true`,
            input.postId ? eq(forumVotes.post_id, input.postId) : sql`true`
          )
        )
        .limit(1);
      
      if (existingVote.length > 0) {
        // Remove old vote
        await database
          .delete(forumVotes)
          .where(eq(forumVotes.id, existingVote[0].id));
        
        // Update counts
        if (input.topicId) {
          const field = existingVote[0].vote_type === "upvote" ? "upvote_count" : "downvote_count";
          await database
            .update(forumTopics)
            .set({ [field]: sql`${forumTopics[field]} - 1` })
            .where(eq(forumTopics.id, input.topicId));
        } else if (input.postId) {
          const field = existingVote[0].vote_type === "upvote" ? "upvote_count" : "downvote_count";
          await database
            .update(forumPosts)
            .set({ [field]: sql`${forumPosts[field]} - 1` })
            .where(eq(forumPosts.id, input.postId));
        }
        
        // If same vote type, just remove (toggle off)
        if (existingVote[0].vote_type === input.voteType) {
          return { success: true, action: "removed" };
        }
      }
      
      // Add new vote
      await database.insert(forumVotes).values({
        user_id: ctx.user.id,
        topic_id: input.topicId,
        post_id: input.postId,
        vote_type: input.voteType,
      });
      
      // Update counts
      if (input.topicId) {
        const field = input.voteType === "upvote" ? "upvote_count" : "downvote_count";
        await database
          .update(forumTopics)
          .set({ [field]: sql`${forumTopics[field]} + 1` })
          .where(eq(forumTopics.id, input.topicId));
        
        // Create notification for upvote only
        if (input.voteType === "upvote") {
          const topic = await database
            .select({ user_id: forumTopics.user_id })
            .from(forumTopics)
            .where(eq(forumTopics.id, input.topicId))
            .limit(1);
          
          if (topic.length > 0 && topic[0].user_id !== ctx.user.id) {
            await database.insert(forumNotifications).values({
              user_id: topic[0].user_id,
              notification_type: "upvote_topic",
              topic_id: input.topicId,
              from_user_id: ctx.user.id,
            });
          }
        }
      } else if (input.postId) {
        const field = input.voteType === "upvote" ? "upvote_count" : "downvote_count";
        await database
          .update(forumPosts)
          .set({ [field]: sql`${forumPosts[field]} + 1` })
          .where(eq(forumPosts.id, input.postId));
        
        // Create notification for upvote only
        if (input.voteType === "upvote") {
          const post = await database
            .select({ user_id: forumPosts.user_id, topic_id: forumPosts.topic_id })
            .from(forumPosts)
            .where(eq(forumPosts.id, input.postId))
            .limit(1);
          
          if (post.length > 0 && post[0].user_id !== ctx.user.id) {
            await database.insert(forumNotifications).values({
              user_id: post[0].user_id,
              notification_type: "upvote_post",
              topic_id: post[0].topic_id,
              post_id: input.postId,
              from_user_id: ctx.user.id,
            });
          }
        }
      }
      
      return { success: true, action: "added" };
    }),

  // Get user notifications
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await database
      .select({
        id: forumNotifications.id,
        notification_type: forumNotifications.notification_type,
        topic_id: forumNotifications.topic_id,
        post_id: forumNotifications.post_id,
        from_user_name: users.name,
        is_read: forumNotifications.is_read,
        created_at: forumNotifications.created_at,
      })
      .from(forumNotifications)
      .leftJoin(users, eq(forumNotifications.from_user_id, users.id))
      .where(eq(forumNotifications.user_id, ctx.user.id))
      .orderBy(desc(forumNotifications.created_at))
      .limit(50);
  }),

  // Mark notification as read
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database
        .update(forumNotifications)
        .set({ is_read: true })
        .where(
          and(
            eq(forumNotifications.id, input.notificationId),
            eq(forumNotifications.user_id, ctx.user.id)
          )
        );
      
      return { success: true };
    }),
  
  // Mark all notifications as read
  markAllNotificationsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await database
        .update(forumNotifications)
        .set({ is_read: true })
        .where(eq(forumNotifications.user_id, ctx.user.id));
      
      return { success: true };
    }),
  
  // Get unread notifications count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await database
        .select({ count: sql<number>`count(*)` })
        .from(forumNotifications)
        .where(
          and(
            eq(forumNotifications.user_id, ctx.user.id),
            eq(forumNotifications.is_read, false)
          )
        );
      
      return { count: Number(result[0]?.count || 0) };
    }),

  // Update topic (within 5 minutes)
  updateTopic: protectedProcedure
    .input(z.object({
      topicId: z.number(),
      title: z.string().min(5).max(255).optional(),
      content: z.string().min(20).max(10000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get topic
      const topic = await database
        .select()
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      // Check ownership
      if (topic[0].user_id !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own topics" });
      }
      
      // Check 5-minute window (for non-admins)
      if (ctx.user.role !== "admin" && !canEditOrDelete(topic[0].created_at)) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You can only edit topics within 5 minutes of posting" 
        });
      }
      
      // Update topic
      await database
        .update(forumTopics)
        .set({
          ...(input.title && { title: input.title }),
          ...(input.content && { content: input.content }),
        })
        .where(eq(forumTopics.id, input.topicId));
      
      return { success: true };
    }),

  // Delete topic (within 5 minutes)
  deleteTopic: protectedProcedure
    .input(z.object({ topicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get topic
      const topic = await database
        .select()
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      // Check ownership
      if (topic[0].user_id !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own topics" });
      }
      
      // Check 5-minute window (for non-admins)
      if (ctx.user.role !== "admin" && !canEditOrDelete(topic[0].created_at)) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You can only delete topics within 5 minutes of posting" 
        });
      }
      
      // Delete topic (cascade will delete posts)
      await database
        .delete(forumTopics)
        .where(eq(forumTopics.id, input.topicId));
      
      return { success: true };
    }),

  // Update post (within 5 minutes)
  updatePost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      content: z.string().min(10).max(10000),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get post
      const post = await database
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.postId))
        .limit(1);
      
      if (post.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      
      // Check ownership
      if (post[0].user_id !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own posts" });
      }
      
      // Check 5-minute window (for non-admins)
      if (ctx.user.role !== "admin" && !canEditOrDelete(post[0].created_at)) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You can only edit posts within 5 minutes of posting" 
        });
      }
      
      // Update post
      await database
        .update(forumPosts)
        .set({ content: input.content })
        .where(eq(forumPosts.id, input.postId));
      
      return { success: true };
    }),

  // Delete post (within 5 minutes)
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get post
      const post = await database
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.postId))
        .limit(1);
      
      if (post.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      
      // Check ownership
      if (post[0].user_id !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own posts" });
      }
      
      // Check 5-minute window (for non-admins)
      if (ctx.user.role !== "admin" && !canEditOrDelete(post[0].created_at)) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You can only delete posts within 5 minutes of posting" 
        });
      }
      
      // Delete post
      await database
        .delete(forumPosts)
        .where(eq(forumPosts.id, input.postId));
      
      // Update topic reply count
      await database
        .update(forumTopics)
        .set({ reply_count: sql`${forumTopics.reply_count} - 1` })
        .where(eq(forumTopics.id, post[0].topic_id));
      
      return { success: true };
    }),

  // Report content
  reportContent: protectedProcedure
    .input(z.object({
      topicId: z.number().optional(),
      postId: z.number().optional(),
      reason: z.enum(["spam", "harassment", "inappropriate", "misinformation", "other"]),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate that either topicId or postId is provided
      if (!input.topicId && !input.postId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Either topicId or postId must be provided" 
        });
      }
      
      await database.insert(forumReports).values({
        reporter_user_id: ctx.user.id,
        topic_id: input.topicId || null,
        post_id: input.postId || null,
        reason: input.reason,
        details: input.details,
      });
      
      // Check if 3+ reports, auto-hide
      const reports = await database
        .select()
        .from(forumReports)
        .where(
          input.topicId 
            ? eq(forumReports.topic_id, input.topicId)
            : eq(forumReports.post_id, input.postId)
        );
      
      if (reports.length >= 3) {
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
      }
      
      return { success: true };
    }),

  // Admin/Moderator: Ban user
  banUser: moderatorProcedure
    .input(z.object({
      userId: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await database
        .update(users)
        .set({
          is_banned: true,
          banned_at: new Date(),
          banned_by: ctx.user.id,
          ban_reason: input.reason,
        })
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),

  // Admin: Unban user
  unbanUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database
        .update(users)
        .set({
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null,
        })
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),

  // Admin: Add moderator
  addModerator: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database.insert(forumModerators).values({
        user_id: input.userId,
        assigned_by: ctx.user.id,
      });
      
      return { success: true };
    }),

  // Admin: Remove moderator
  removeModerator: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database
        .delete(forumModerators)
        .where(eq(forumModerators.user_id, input.userId));
      
      return { success: true };
    }),
  
  // Moderator: Pin/Unpin topic
  togglePinTopic: moderatorProcedure
    .input(z.object({ topicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const topic = await database
        .select({ is_pinned: forumTopics.is_pinned })
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      await database
        .update(forumTopics)
        .set({ is_pinned: !topic[0].is_pinned })
        .where(eq(forumTopics.id, input.topicId));
      
      return { success: true, is_pinned: !topic[0].is_pinned };
    }),
  
  // Moderator: Lock/Unlock topic
  toggleLockTopic: moderatorProcedure
    .input(z.object({ topicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const topic = await database
        .select({ is_locked: forumTopics.is_locked })
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      await database
        .update(forumTopics)
        .set({ is_locked: !topic[0].is_locked })
        .where(eq(forumTopics.id, input.topicId));
      
      return { success: true, is_locked: !topic[0].is_locked };
    }),
  
  // Moderator: Hide/Unhide topic
  toggleHideTopic: moderatorProcedure
    .input(z.object({ topicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const topic = await database
        .select({ is_hidden: forumTopics.is_hidden })
        .from(forumTopics)
        .where(eq(forumTopics.id, input.topicId))
        .limit(1);
      
      if (topic.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }
      
      await database
        .update(forumTopics)
        .set({ is_hidden: !topic[0].is_hidden })
        .where(eq(forumTopics.id, input.topicId));
      
      return { success: true, is_hidden: !topic[0].is_hidden };
    }),
  
  // Moderator: Get all reports
  getReports: moderatorProcedure
    .input(z.object({
      status: z.enum(["pending", "resolved", "all"]).optional().default("pending"),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const reports = await database
        .select({
          id: forumReports.id,
          reporter_user_id: forumReports.reporter_user_id,
          reporter_name: users.name,
          topic_id: forumReports.topic_id,
          post_id: forumReports.post_id,
          reason: forumReports.reason,
          details: forumReports.details,
          status: forumReports.status,
          created_at: forumReports.created_at,
        })
        .from(forumReports)
        .leftJoin(users, eq(forumReports.reporter_user_id, users.id))
        .where(
          input.status === "all" 
            ? sql`true` 
            : eq(forumReports.status, input.status)
        )
        .orderBy(desc(forumReports.created_at))
        .limit(input.limit);
      
      return reports;
    }),
  
  // Moderator: Resolve report
  resolveReport: moderatorProcedure
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database
        .update(forumReports)
        .set({
          status: "resolved",
          resolved_by: ctx.user.id,
          resolved_at: new Date(),
        })
        .where(eq(forumReports.id, input.reportId));
      
      return { success: true };
    }),
  
  // Admin: Get all users with stats
  getAllUsers: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      // Get users
      const usersQuery = database
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          is_banned: users.is_banned,
          banned_at: users.banned_at,
          banned_by: users.banned_by,
          ban_reason: users.ban_reason,
          created_at: users.created_at,
        })
        .from(users);
      
      const allUsers = await usersQuery.limit(input.limit);
      
      // Get moderators list
      const moderatorsList = await database
        .select({ user_id: forumModerators.user_id })
        .from(forumModerators);
      
      const moderatorIds = new Set(moderatorsList.map(m => m.user_id));
      
      // Add isModerator flag
      const usersWithFlags = allUsers.map(user => ({
        ...user,
        isModerator: moderatorIds.has(user.id),
      }));
      
      return usersWithFlags;
    }),
  
  // Admin: Get moderators list
  getModerators: adminProcedure
    .query(async ({ ctx }) => {
      const moderators = await database
        .select({
          id: forumModerators.id,
          user_id: forumModerators.user_id,
          user_name: users.name,
          user_email: users.email,
          assigned_at: forumModerators.assigned_at,
          assigned_by: forumModerators.assigned_by,
        })
        .from(forumModerators)
        .leftJoin(users, eq(forumModerators.user_id, users.id));
      
      return moderators;
    }),
});
