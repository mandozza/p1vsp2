'use server';

import dbConnect from '@/lib/db';
import { BetaPageView } from '@/models/BetaPageView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BetaCode } from '@/models/BetaCode';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';

/**
 * Validates a beta code and sets a secure cookie.
 */
export async function redeemCode(code: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const normalized = code.trim().toUpperCase();

    const betaDoc = await BetaCode.findOne({ code: normalized });
    if (!betaDoc) return { success: false, error: 'Invalid invite code' };
    if (betaDoc.usedAt) return { success: false, error: 'This code has already been used' };

    // Mark as used
    betaDoc.usedAt = new Date();
    await betaDoc.save();

    // Set cookie for 30 days
    const cookieStore = await cookies();
    cookieStore.set('pro-project_beta_access', '1', {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generates new beta invite codes. Admin only.
 */
export async function generateCodes(count: number, note?: string): Promise<ActionResult> {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push({ code, note });
    }

    await BetaCode.insertMany(codes);
    revalidatePath('/admin/beta');
    return { success: true, data: codes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Lists all beta codes. Admin only.
 */
export async function listBetaCodes() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') return [];

    return await BetaCode.find({}).sort({ createdAt: -1 }).lean();
  } catch {
    return [];
  }
}

/**
 * Logs a page view for user journey analytics.
...

 * Non-blocking and silent.
 */
export async function trackPageView(path: string, sessionId: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    await BetaPageView.create({
      sessionId,
      path,
      userId: session?.user?.id,
    });

    return { success: true };
  } catch (error) {
    // Silent fail to avoid disrupting user experience
    console.error('Failed to track page view:', error);
    return { success: false };
  }
}
