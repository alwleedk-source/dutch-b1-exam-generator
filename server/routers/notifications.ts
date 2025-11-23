import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";

const database = await getDb();
import { 
  notifications,
  users,
  exams
} from "../../drizzle/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

/**
 * Helper function to create a notification
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
  examId,
  topicId,
  postId,
  vocabId,
  fromUserId,
  priority = 'normal',
}: {
  userId: number;
  type: string;
  title: string;
  message?: string;
  actionUrl?: string;
  examId?: number;
  topicId?: number;
  postId?: number;
  vocabId?: number;
  fromUserId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}) {
  await database.insert(notifications).values({
    user_id: userId,
    type,
    title,
    message,
    action_url: actionUrl,
    exam_id: examId,
    topic_id: topicId,
    post_id: postId,
    vocab_id: vocabId,
    from_user_id: fromUserId,
    priority,
  });
}

/**
 * Notifications router
 */
export const notificationsRouter = router({
  // Get all notifications with grouping
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    const allNotifications = await database
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        action_url: notifications.action_url,
        exam_id: notifications.exam_id,
        topic_id: notifications.topic_id,
        post_id: notifications.post_id,
        vocab_id: notifications.vocab_id,
        from_user_id: notifications.from_user_id,
        from_user_name: users.name,
        is_read: notifications.is_read,
        priority: notifications.priority,
        created_at: notifications.created_at,
        read_at: notifications.read_at,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.from_user_id, users.id))
      .where(eq(notifications.user_id, ctx.user.id))
      .orderBy(desc(notifications.created_at))
      .limit(100);

    // Group similar notifications
    const grouped = groupNotifications(allNotifications);
    
    return grouped;
  }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await database
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.user_id, ctx.user.id),
          eq(notifications.is_read, false)
        )
      );
    
    return { count: Number(result[0]?.count || 0) };
  }),

  // Mark notification as read
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await database
        .update(notifications)
        .set({ is_read: true, read_at: new Date() })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.user_id, ctx.user.id)
          )
        );
      
      return { success: true };
    }),
  
  // Mark multiple notifications as read (for grouped notifications)
  markNotificationsRead: protectedProcedure
    .input(z.object({ notificationIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      if (input.notificationIds.length === 0) return { success: true };
      
      await database
        .update(notifications)
        .set({ is_read: true, read_at: new Date() })
        .where(
          and(
            inArray(notifications.id, input.notificationIds),
            eq(notifications.user_id, ctx.user.id)
          )
        );
      
      return { success: true };
    }),
  
  // Mark all notifications as read
  markAllNotificationsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      await database
        .update(notifications)
        .set({ is_read: true, read_at: new Date() })
        .where(eq(notifications.user_id, ctx.user.id));
      
      return { success: true };
    }),
});

/**
 * Group similar notifications together
 * Example: 9 "new_public_exam" notifications → "9 new public exams available"
 */
function groupNotifications(notifications: any[]) {
  const grouped: any[] = [];
  const groupMap = new Map<string, any[]>();

  // Types that should be grouped
  const groupableTypes = [
    'new_public_exam',
    'exam_rated',
    'vocab_review_due',
    'achievement_unlocked',
  ];

  for (const notification of notifications) {
    if (groupableTypes.includes(notification.type)) {
      // Group by type
      const key = notification.type;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(notification);
    } else {
      // Don't group - add directly
      grouped.push({
        ...notification,
        count: 1,
        notification_ids: [notification.id],
      });
    }
  }

  // Process grouped notifications
  for (const [type, items] of groupMap.entries()) {
    if (items.length === 1) {
      // Only one notification - don't group
      grouped.push({
        ...items[0],
        count: 1,
        notification_ids: [items[0].id],
      });
    } else {
      // Multiple notifications - group them
      const firstItem = items[0];
      const allRead = items.every(item => item.is_read);
      const notificationIds = items.map(item => item.id);
      
      grouped.push({
        id: firstItem.id, // Use first ID for reference
        type: firstItem.type,
        title: getGroupedTitle(type, items.length),
        message: getGroupedMessage(type, items),
        action_url: getGroupedActionUrl(type),
        is_read: allRead,
        priority: firstItem.priority,
        created_at: firstItem.created_at,
        count: items.length,
        notification_ids: notificationIds,
      });
    }
  }

  // Sort by created_at
  grouped.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return grouped;
}

/**
 * Get grouped notification title based on type and count
 */
function getGroupedTitle(type: string, count: number): string {
  switch (type) {
    case 'new_public_exam':
      return `${count} new public exams available`;
    case 'exam_rated':
      return `${count} people rated your exams`;
    case 'vocab_review_due':
      return `${count} words to review`;
    case 'achievement_unlocked':
      return `${count} new achievements unlocked`;
    default:
      return `${count} notifications`;
  }
}

/**
 * Get grouped notification message
 */
function getGroupedMessage(type: string, items: any[]): string {
  const names = items
    .filter(item => item.from_user_name)
    .map(item => item.from_user_name)
    .slice(0, 3);
  
  if (names.length > 0) {
    const nameList = names.join(', ');
    const others = items.length - names.length;
    if (others > 0) {
      return `${nameList} and ${others} others`;
    }
    return nameList;
  }
  
  return '';
}

/**
 * Get action URL for grouped notifications
 */
function getGroupedActionUrl(type: string): string {
  switch (type) {
    case 'new_public_exam':
      return '/public-exams';
    case 'exam_rated':
      return '/my-exams';
    case 'vocab_review_due':
      return '/vocabulary';
    case 'achievement_unlocked':
      return '/achievements';
    default:
      return '/dashboard';
  }
}
