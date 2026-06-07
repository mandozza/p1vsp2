import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMyNotifications } from '@/actions/notification.actions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

  const notifications = await getMyNotifications();
  return NextResponse.json(notifications);
}
