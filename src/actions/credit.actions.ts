'use server';

import { db } from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Adds credits to a user balance.
 */
export async function addCredits(amount: number, userId?: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    // If no userId provided, use current session user
    const targetId = userId || session?.user?.id;
    if (!targetId) return { success: false, error: 'User not found' };

    // Only admins can add credits to others, or users can potentially earn them
    if (userId && userId !== session?.user?.id && session?.user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const [user] = await db.select().from(User).where(eq(User.id, targetId));
    if (!user) return { success: false, error: 'User not found' };

    const newBalance = user.creditBalance + amount;
    await db.update(User)
      .set({
        creditBalance: newBalance,
        updatedAt: new Date()
      })
      .where(eq(User.id, targetId));

    revalidatePath('/');
    return { success: true, data: newBalance };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

