import dbConnect from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { Game } from '@/models/Game';
import { AdminTournamentsClient } from '@/components/admin/AdminTournamentsClient';

export default async function AdminTournamentsPage() {
  await dbConnect();
  const tournaments = await Tournament.find({})
    .populate('gameId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const games = await Game.find({ active: true }).sort({ title: 1 }).lean();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminTournamentsClient 
        initialTournaments={JSON.parse(JSON.stringify(tournaments))} 
        games={JSON.parse(JSON.stringify(games))} 
      />
    </div>
  );
}
