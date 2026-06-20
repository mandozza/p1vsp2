import { DashboardClient } from '@/components/admin/DashboardClient';
import { db } from '@/lib/db';
import { users, betaCodes } from '@/models/schema';
import { getDashboardConfig } from '@/actions/settings.actions';
import { count, sum, isNull } from 'drizzle-orm';

export default async function AdminDashboardPage() {
  const config = await getDashboardConfig();

  const totalUsersResult = await db.select({ count: count() }).from(users);
  const activeBetaCodesResult = await db.select({ count: count() }).from(betaCodes).where(isNull(betaCodes.usedAt));
  const totalCreditsResult = await db.select({ total: sum(users.creditBalance) }).from(users);

  // Initial data fetch
  const stats = {
    totalUsers: totalUsersResult[0]?.count || 0,
    activeBetaCodes: activeBetaCodesResult[0]?.count || 0,
    totalCredits: Number(totalCreditsResult[0]?.total || 0),
    systemStatus: 'online'
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Intelligence
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/30">
          Real-time system metrics and overview
        </p>
      </div>

      <DashboardClient initialStats={stats} config={config} />
    </div>
  );
}

