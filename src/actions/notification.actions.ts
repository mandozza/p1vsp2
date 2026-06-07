'use server';

import dbConnect from '@/lib/db';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendWebPush } from '@/lib/push';

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
    await dbConnect();
    const notification = await Notification.create(data);

    // 1. Check for Web Push Subscription
    const user = await User.findById(data.userId).select('pushSubscription');
    if (user?.pushSubscription) {
      const result = await sendWebPush(user.pushSubscription, {
        title: data.title,
        body: data.message,
        url: data.link || '/',
      });

      // Cleanup if expired
      if (result?.expired) {
        user.pushSubscription = undefined;
        await user.save();
      }
    }

    return { success: true, id: notification._id };
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
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
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
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { isRead: true }
    );

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
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };

    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { isRead: true }
    );

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return { success: false };
  }
}
