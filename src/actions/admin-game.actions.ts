'use server';

import dbConnect from '@/lib/db';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveGame(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await dbConnect();
  
  if (data._id) {
    const { _id, ...update } = data;
    await Game.findByIdAndUpdate(_id, update);
  } else {
    await Game.create(data);
  }

  revalidatePath('/admin/games');
  revalidatePath('/players');
  return { success: true };
}

export async function toggleGameActive(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await dbConnect();
  const game = await Game.findById(id);
  if (game) {
    game.active = !game.active;
    await game.save();
  }

  revalidatePath('/admin/games');
  return { success: true };
}
