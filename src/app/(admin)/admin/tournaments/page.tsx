import { db } from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { Game } from '@/models/Game';
import { AdminTournamentsClient } from '@/components/admin/AdminTournamentsClient';
import { desc, eq, asc } from 'drizzle-orm';

export default async function AdminTournamentsPage() {
  const rawTournaments = await db.query.tournaments.findMany({
    orderBy: [desc(Tournament.createdAt)],
    with: {
      game: {
        columns: {
          title: true,
        }
      }
    }
  });

  const tournaments = rawTournaments.map((t: any) => ({
    ...t,
    _id: t.id,
    gameId: t.game ? { ...t.game, _id: t.gameId } : null,
  }));

  const rawGames = await db.select().from(Game).where(eq(Game.active, true)).orderBy(asc(Game.title));
  const games = rawGames.map((g: any) => ({
    ...g,
    _id: g.id,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <AdminTournamentsClient 
        initialTournaments={JSON.parse(JSON.stringify(tournaments))} 
        games={JSON.parse(JSON.stringify(games))} 
      />
    </div>
  );
}

