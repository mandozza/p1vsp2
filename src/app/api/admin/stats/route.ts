import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, betaCodes } from '@/models/schema';
import { count, sum, isNull } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const totalUsersResult = await db.select({ count: count() }).from(users);
    const activeBetaCodesResult = await db.select({ count: count() }).from(betaCodes).where(isNull(betaCodes.usedAt));
    const totalCreditsResult = await db.select({ total: sum(users.creditBalance) }).from(users);

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      activeBetaCodes: activeBetaCodesResult[0]?.count || 0,
      totalCredits: Number(totalCreditsResult[0]?.total || 0),
      systemStatus: 'online'
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

