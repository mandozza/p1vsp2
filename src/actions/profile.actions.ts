'use server';

import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { generateCombatStyleReport } from '@/lib/combat-analyst';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { customAlphabet } from 'nanoid';
import { verifyProfileScreenshot } from '@/lib/ai-verifier';
import { getUploadUrl, getPublicUrl } from '@/lib/s3';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export async function getProfileUploadUrl(type: 'verification' | 'avatar' | 'banner', contentType: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: 'Unauthorized' };

  const filename = `profiles/${session.user.id}/${type}-${nanoid()}`;
  const uploadUrl = await getUploadUrl(filename, contentType);
  const publicUrl = getPublicUrl(filename);

  return { success: true, data: { uploadUrl, publicUrl } };
}

export async function initiateVerification(gamerTag: string, platform: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await dbConnect();
  
  const verificationCode = `ARC-${nanoid()}`;
  
  await User.findByIdAndUpdate(session.user.id, {
    gamerTag,
    tagPlatform: platform,
    verificationCode,
    verificationStatus: 'pending',
  });

  revalidatePath(`/profile/${(session.user as any).username}`);
  return { success: true, code: verificationCode };
}

export async function verifyOperatorTag(screenshotUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user || !user.verificationCode) throw new Error('Verification not initiated');

  // 1. Analyze screenshot with Gemini
  const result = await verifyProfileScreenshot(screenshotUrl);
  if (!result) return { success: false, error: 'AI Analysis Failed. Ensure Gamer Tag and Bio are visible.' };

  // 2. Compare Gamer Tag and Bio Code
  const tagMatches = result.gamerTag?.toLowerCase().includes(user.gamerTag?.toLowerCase() || '') || 
                     user.gamerTag?.toLowerCase().includes(result.gamerTag?.toLowerCase() || '');
  
  const codeMatches = result.bioCode === user.verificationCode;

  if (tagMatches && codeMatches) {
    user.verificationStatus = 'verified';
    await user.save();
    revalidatePath(`/profile/${user.username}`);
    return { success: true };
  }

  return { 
    success: false, 
    error: `Verification Conflict. Visible Tag: ${result.gamerTag}, Code: ${result.bioCode === user.verificationCode ? 'MATCH' : 'MISMATCH'}` 
  };
}

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
  const update: any = {
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
    bio: data.bio,
    linkedAccounts: {
      psn: data.psn,
      xbox: data.xbox,
      discord: data.discord,
    }
  };

  // Remove undefined fields
  Object.keys(update).forEach(key => update[key] === undefined && delete update[key]);

  await User.findByIdAndUpdate(session.user.id, update);

  revalidatePath(`/profile/${(session.user as any).username}`);
  revalidatePath(`/settings`);
  return { success: true };
}
