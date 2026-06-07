import { AdminBetaClient } from '@/components/beta/AdminBetaClient';
import dbConnect from '@/lib/db';
import { BetaCode } from '@/models/BetaCode';
import { BetaPageView } from '@/models/BetaPageView';

export default async function AdminBetaPage() {
  await dbConnect();

  const codes = await BetaCode.find({}).sort({ createdAt: -1 }).lean();
  
  // Group page views by sessionId for journey tracking
  const rawJourneys = await BetaPageView.aggregate([
    {
      $group: {
        _id: '$sessionId',
        views: { $push: '$$ROOT' },
        latest: { $max: '$createdAt' }
      }
    },
    { $sort: { latest: -1 } },
    { $limit: 20 }
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminBetaClient 
        codes={JSON.parse(JSON.stringify(codes))} 
        journeys={JSON.parse(JSON.stringify(rawJourneys))} 
      />
    </div>
  );
}
