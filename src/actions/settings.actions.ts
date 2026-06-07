'use server';

import dbConnect from '@/lib/db';
import { AppSettings } from '@/models/AppSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getDashboardConfig() {
  await dbConnect();
  
  const settings = await AppSettings.find({
    key: { $in: ['pollingInterval', 'agentActive'] }
  });

  const config = {
    pollingInterval: 10000, // Default 10s
    agentActive: true,
  };

  settings.forEach(s => {
    if (s.key === 'pollingInterval') config.pollingInterval = s.value;
    if (s.key === 'agentActive') config.agentActive = s.value;
  });

  return config;
}

export async function updateDashboardConfig(key: string, value: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') throw new Error('Unauthorized');

  await dbConnect();
  await AppSettings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true }
  );

  return { success: true };
}
