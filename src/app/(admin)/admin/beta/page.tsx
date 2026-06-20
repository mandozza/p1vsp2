import { AdminBetaClient } from '@/components/beta/AdminBetaClient';
import { db } from '@/lib/db';
import { BetaCode } from '@/models/BetaCode';
import { BetaPageView } from '@/models/BetaPageView';
import { desc } from 'drizzle-orm';

export default async function AdminBetaPage() {
  const codes = await db.select().from(BetaCode).orderBy(desc(BetaCode.createdAt));
  
  // Fetch latest page views and group by sessionId in memory
  const pageViews = await db.select().from(BetaPageView).orderBy(desc(BetaPageView.createdAt)).limit(500);

  const journeysMap = new Map<string, any>();
  for (const view of pageViews) {
    if (!journeysMap.has(view.sessionId)) {
      journeysMap.set(view.sessionId, {
        _id: view.sessionId,
        views: [],
        latest: view.createdAt,
      });
    }
    const journey = journeysMap.get(view.sessionId);
    journey.views.push({
      ...view,
      _id: view.id,
    });
  }

  const rawJourneys = Array.from(journeysMap.values())
    .sort((a, b) => b.latest.getTime() - a.latest.getTime())
    .slice(0, 20);

  return (
    <div className="mx-auto max-w-7xl">
      <AdminBetaClient 
        codes={JSON.parse(JSON.stringify(codes))} 
        journeys={JSON.parse(JSON.stringify(rawJourneys))} 
      />
    </div>
  );
}

