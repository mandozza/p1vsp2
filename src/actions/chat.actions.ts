'use server';

import { db } from '@/lib/db';
import { ChatMessage } from '@/models/ChatMessage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function sendMessage(message: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await db.insert(ChatMessage)
    .values({
      userId: session.user.id,
      message,
    });

  return { success: true };
}

export async function getRecentMessages(limit = 50) {
  const rawMessages = await db.query.chatMessages.findMany({
    orderBy: [desc(ChatMessage.createdAt)],
    limit,
    with: {
      user: {
        columns: {
          username: true
        }
      }
    }
  });

  return rawMessages.map((m: any) => ({
    ...m,
    _id: m.id,
    userId: m.user ? { ...m.user, _id: m.userId } : { username: 'System', _id: m.userId }
  }));
}

