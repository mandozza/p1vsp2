'use server';

import { db } from '@/lib/db';
import { BetaPageView } from '@/models/BetaPageView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BetaCode } from '@/models/BetaCode';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ActionResult } from './credit.actions';
import { eq, desc } from 'drizzle-orm';

/**
 * Validates a beta code and sets a secure cookie.
 */
export async function redeemCode(code: string): Promise<ActionResult> {
  try {
    const normalized = code.trim().toUpperCase();

    const [betaDoc] = await db.select().from(BetaCode).where(eq(BetaCode.code, normalized));
    if (!betaDoc) return { success: false, error: 'Invalid invite code' };
    if (betaDoc.usedAt) return { success: false, error: 'This code has already been used' };

    // Mark as used
    await db.update(BetaCode)
      .set({
        usedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(BetaCode.id, betaDoc.id));

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
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push({ code, note });
    }

    await db.insert(BetaCode).values(codes);
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
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') return [];

    const codes = await db.select().from(BetaCode).orderBy(desc(BetaCode.createdAt));
    return codes.map((c: any) => ({
      ...c,
      _id: c.id,
    }));
  } catch {
    return [];
  }
}

/**
 * Logs a page view for user journey analytics.
 * Non-blocking and silent.
 */
export async function trackPageView(path: string, sessionId: string) {
  try {
    const session = await getServerSession(authOptions);

    await db.insert(BetaPageView).values({
      sessionId,
      path,
      userId: session?.user?.id || null,
    });

    return { success: true };
  } catch (error) {
    // Silent fail to avoid disrupting user experience
    console.error('Failed to track page view:', error);
    return { success: false };
  }
}
