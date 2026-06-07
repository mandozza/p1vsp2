import dbConnect from '@/lib/db';
import { Game } from '@/models/Game';
import { AdminGamesClient } from '@/components/admin/AdminGamesClient';

export default async function AdminGamesPage() {
  await dbConnect();
  const games = await Game.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminGamesClient initialGames={JSON.parse(JSON.stringify(games))} />
    </div>
  );
}
