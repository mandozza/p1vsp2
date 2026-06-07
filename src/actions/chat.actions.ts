'use server';

import dbConnect from '@/lib/db';
import { ChatMessage } from '@/models/ChatMessage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function sendMessage(message: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await dbConnect();
  
  await ChatMessage.create({
    userId: session.user.id,
    message,
  });

  return { success: true };
}

export async function getRecentMessages(limit = 50) {
  await dbConnect();
  return await ChatMessage.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username')
    .lean();
}
