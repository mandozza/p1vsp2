import { DashboardClient } from '@/components/admin/DashboardClient';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { BetaCode } from '@/models/BetaCode';
import { getDashboardConfig } from '@/actions/settings.actions';

export default async function AdminDashboardPage() {
  await dbConnect();
  const config = await getDashboardConfig();

  // Initial data fetch
  const stats = {
    totalUsers: await User.countDocuments(),
    activeBetaCodes: await BetaCode.countDocuments({ usedAt: { $exists: false } }),
    totalCredits: await User.aggregate([
      { $group: { _id: null, total: { $sum: '$creditBalance' } } }
    ]).then(res => res[0]?.total || 0),
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
