import { db } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Match } from '@/models/Match';
import { Game } from '@/models/Game';
import { Trophy, Swords, Zap, Shield, Crown, Medal, TrendingUp, Activity, ShieldCheck, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LeaderboardClient } from '@/components/custom/LeaderboardClient';
import { eq, and, asc, count, sql } from 'drizzle-orm';

export default async function LeaderboardPage({ searchParams }: { searchParams: { gameId?: string } }) {
  const activeGames = await db.select().from(Game).where(eq(Game.active, true)).orderBy(asc(Game.title));
  const selectedGameId = searchParams.gameId || activeGames[0]?.id;

  // 1. Fetch Top 50 Players by specific Game ELO
  const allMembers = await db.select().from(User).where(eq(User.role, 'member')) as IUser[];
  const topPlayers = allMembers
    .map(p => {
      const matchedStat = p.gameStats?.find(gs => String(gs.gameId) === String(selectedGameId));
      if (!matchedStat) return null;
      return {
        ...p,
        _id: p.id,
        gameStat: matchedStat,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.gameStat.eloRating - a.gameStat.eloRating)
    .slice(0, 50);


  // 2. Sector Stats
  const [completedMatchesRes] = await db
    .select({ value: count() })
    .from(Match)
    .where(and(eq(Match.gameId, selectedGameId), eq(Match.status, 'completed')));

  const [aiMatchesRes] = await db
    .select({ value: count() })
    .from(Match)
    .where(
      and(
        eq(Match.gameId, selectedGameId),
        sql`final_outcome->>'resolvedBy' = 'ai'`
      )
    );

  const stats = {
    totalMatches: completedMatchesRes?.value ?? 0,
    totalPlayers: topPlayers.length,
    aiVerifications: aiMatchesRes?.value ?? 0,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-neon-pink/20 bg-neon-pink/5 px-4 py-1.5 mb-6">
          <Crown className="h-4 w-4 text-neon-pink" />
          <span className="text-xs font-black uppercase tracking-widest text-neon-pink">Official Sector Rankings</span>
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white text-glow-pink mb-4">
          The <span className="text-neon-pink">Leaderboard</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm font-bold uppercase tracking-widest text-white/30">
          Rankings are now sector-specific. Select a game protocol to view the elite operators in that arena.
        </p>
      </div>

      <LeaderboardClient 
        games={JSON.parse(JSON.stringify(activeGames))} 
        initialPlayers={JSON.parse(JSON.stringify(topPlayers))}
        selectedGameId={selectedGameId}
        stats={stats}
      />
    </div>
  );
}
