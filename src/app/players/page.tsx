import { db } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trophy, Swords, Zap, Shield, LayoutGrid } from 'lucide-react';
import { PlayersClient } from '@/components/custom/PlayersClient';
import { eq, and, ne, asc } from 'drizzle-orm';

export default async function PlayersPage({ searchParams }: { searchParams: { gameId?: string } }) {
  const session = await getServerSession(authOptions);

  const activeGames = await db.select().from(Game).where(eq(Game.active, true)).orderBy(asc(Game.title));
  const selectedGameId = searchParams.gameId || activeGames[0]?.id;
  
  // Fetch players (members, excluding self)
  const allPlayers = await db.select().from(User).where(
    session?.user?.id 
      ? and(eq(User.role, 'member'), ne(User.id, session.user.id))
      : eq(User.role, 'member')
  ) as IUser[];

  // Map and sort in JS to replicate MongoDB aggregation logic
  const players = allPlayers.map(p => {
    const matchedStats = p.gameStats?.find(gs => String(gs.gameId) === String(selectedGameId));

    return {
      ...p,
      _id: p.id, // maintain compatibility with frontend expected mongo ID string
      sectorStat: matchedStats ? [matchedStats] : []
    };
  }).sort((a, b) => {
    const aElo = a.sectorStat[0]?.eloRating ?? a.eloRating;
    const bElo = b.sectorStat[0]?.eloRating ?? b.eloRating;
    return bElo - aElo;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
            Active <span className="text-neon-pink">Players</span>
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/30">
            Challenge the best to climb the sector leaderboards
          </p>
        </div>
      </div>

      <PlayersClient 
        initialPlayers={JSON.parse(JSON.stringify(players))} 
        games={JSON.parse(JSON.stringify(activeGames))} 
        selectedGameId={selectedGameId}
      />
    </div>
  );
}
