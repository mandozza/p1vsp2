'use server';

import { db } from '@/lib/db';
import { AppSettings } from '@/models/AppSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inArray, eq } from 'drizzle-orm';

export async function getDashboardConfig() {
  const settings = await db.select().from(AppSettings).where(
    inArray(AppSettings.key, ['pollingInterval', 'agentActive'])
  );

  const config = {
    pollingInterval: 10000, // Default 10s
    agentActive: true,
  };

  settings.forEach((s: any) => {
    if (s.key === 'pollingInterval') config.pollingInterval = Number(s.value);
    if (s.key === 'agentActive') config.agentActive = Boolean(s.value);
  });

  return config;
}

export async function updateDashboardConfig(key: string, value: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await db.insert(AppSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: AppSettings.key,
      set: { value, updatedAt: new Date() }
    });

  return { success: true };
}

