'use server';

import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { generateCombatStyleReport } from '@/lib/combat-analyst';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function analyzeCombatStyle(username: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');

    const matchHistory = await Match.find({
      $or: [{ challengerId: user._id }, { defenderId: user._id }],
      status: 'completed'
    })
    .populate('gameId', 'title')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

    // Map user ID for the analyst logic
    const preparedHistory = matchHistory.map(m => ({
      ...m,
      currentUserId: user._id.toString()
    }));

    const report = await generateCombatStyleReport(user.username, preparedHistory);

    return { success: true, data: report };
  } catch (error: any) {
    console.error('Analysis Action Error:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await dbConnect();
  await User.findByIdAndUpdate(session.user.id, {
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
    linkedAccounts: {
      psn: data.psn,
      xbox: data.xbox,
      discord: data.discord,
    }
  });

  revalidatePath(`/profile/${(session.user as any).username}`);
  return { success: true };
}
