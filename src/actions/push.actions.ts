'use server';

import { db } from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eq } from 'drizzle-orm';

/**
 * Saves a user's push subscription to the database.
 */
export async function savePushSubscription(subscription: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    await db.update(User)
      .set({
        pushSubscription: subscription,
        updatedAt: new Date()
      })
      .where(eq(User.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return { success: false };
  }
}

/**
 * Removes a user's push subscription.
 */
export async function removePushSubscription() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    await db.update(User)
      .set({
        pushSubscription: null,
        updatedAt: new Date()
      })
      .where(eq(User.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return { success: false };
  }
}

