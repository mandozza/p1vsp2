'use server';

import { db } from '@/lib/db';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

export async function saveGame(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  const id = data.id || data._id;
  if (id) {
    const { _id, id: rawId, ...update } = data;
    await db.update(Game)
      .set({
        ...update,
        updatedAt: new Date()
      })
      .where(eq(Game.id, id));
  } else {
    await db.insert(Game).values({
      title: data.title,
      slug: data.slug,
      active: data.active ?? true,
      thumbnailUrl: data.thumbnailUrl,
      aiPrompt: data.aiPrompt,
      gameType: data.gameType || 'FIGHTING',
    });
  }

  revalidatePath('/admin/games');
  revalidatePath('/players');
  return { success: true };
}

export async function toggleGameActive(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  const [game] = await db.select().from(Game).where(eq(Game.id, id));
  if (game) {
    await db.update(Game)
      .set({
        active: !game.active,
        updatedAt: new Date()
      })
      .where(eq(Game.id, id));
  }

  revalidatePath('/admin/games');
  return { success: true };
}

