'use server';

import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    // If no userId provided, use current session user
    const targetId = userId || session?.user?.id;
    if (!targetId) return { success: false, error: 'User not found' };

    // Only admins can add credits to others, or users can potentially earn them
    if (userId && userId !== session?.user?.id && session?.user?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await User.findById(targetId);
    if (!user) return { success: false, error: 'User not found' };

    user.creditBalance += amount;
    await user.save();

    revalidatePath('/');
    return { success: true, data: user.creditBalance };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
