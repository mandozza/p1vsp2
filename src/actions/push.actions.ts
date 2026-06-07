'use server';

import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Saves a user's push subscription to the database.
 */
export async function savePushSubscription(subscription: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      pushSubscription: subscription,
    });

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

    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { pushSubscription: "" },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return { success: false };
  }
}
