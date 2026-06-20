'use server';

import { db } from '@/lib/db';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendWebPush } from '@/lib/push';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Creates a new personal notification.
 */
export async function createNotification(data: {
  userId: string;
  type: 'CHALLENGE_RECEIVED' | 'MATCH_RESOLVED' | 'ACHIEVEMENT_UNLOCKED' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
}) {
  try {
    const [notification] = await db.insert(Notification)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        isRead: false,
      })
      .returning();

    // 1. Check for Web Push Subscription
    const [user] = await db.select({ pushSubscription: User.pushSubscription }).from(User).where(eq(User.id, data.userId));
    if (user?.pushSubscription) {
      const result = await sendWebPush(user.pushSubscription, {
        title: data.title,
        body: data.message,
        url: data.link || '/',
      });

      // Cleanup if expired
      if (result?.expired) {
        await db.update(User)
          .set({ pushSubscription: null, updatedAt: new Date() })
          .where(eq(User.id, data.userId));
      }
    }

    return { success: true, id: notification.id };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false };
  }
}

/**
 * Fetches notifications for the current user.
 */
export async function getMyNotifications(limit = 20) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    const rawNotifications = await db.select().from(Notification)
      .where(eq(Notification.userId, session.user.id))
      .orderBy(desc(Notification.createdAt))
      .limit(limit);

    // Map _id to id for backwards compatibility
    return rawNotifications.map((n: any) => ({
      ...n,
      _id: n.id,
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };

    await db.update(Notification)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(Notification.id, notificationId), eq(Notification.userId, session.user.id)));

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return { success: false };
  }
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };

    await db.update(Notification)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(Notification.userId, session.user.id), eq(Notification.isRead, false)));

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return { success: false };
  }
}

