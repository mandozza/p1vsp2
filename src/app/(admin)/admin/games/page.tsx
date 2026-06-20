import { db } from '@/lib/db';
import { Game } from '@/models/Game';
import { AdminGamesClient } from '@/components/admin/AdminGamesClient';
import { desc } from 'drizzle-orm';

export default async function AdminGamesPage() {
  const games = await db.select().from(Game).orderBy(desc(Game.createdAt));

  return (
    <div className="mx-auto max-w-7xl">
      <AdminGamesClient initialGames={JSON.parse(JSON.stringify(games))} />
    </div>
  );
}

