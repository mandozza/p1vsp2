import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { BetaCode } from '@/models/BetaCode';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const stats = {
      totalUsers: await User.countDocuments(),
      activeBetaCodes: await BetaCode.countDocuments({ usedAt: { $exists: false } }),
      totalCredits: await User.aggregate([
        { $group: { _id: null, total: { $sum: '$creditBalance' } } }
      ]).then(res => res[0]?.total || 0),
      systemStatus: 'online'
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
