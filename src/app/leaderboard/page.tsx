import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { Game } from '@/models/Game';
import { UserAchievement } from '@/models/UserAchievement';
import { Trophy, Swords, Zap, Shield, Crown, Medal, TrendingUp, Activity, ShieldCheck, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import mongoose from 'mongoose';
import { LeaderboardClient } from '@/components/custom/LeaderboardClient';

export default async function LeaderboardPage({ searchParams }: { searchParams: { gameId?: string } }) {
  await dbConnect();

  const games = await Game.find({ active: true }).sort({ title: 1 }).lean();
  const selectedGameId = searchParams.gameId || games[0]?._id?.toString();

  // 1. Fetch Top 50 Players by specific Game ELO
  // We use aggregation to find players who have stats for the selected game
  const topPlayers = await User.aggregate([
    { 
      $match: { 
        role: 'member', 
        'gameStats.gameId': new mongoose.Types.ObjectId(selectedGameId) 
      } 
    },
    { 
      $project: {
        username: 1,
        verificationStatus: 1,
        gameStat: {
          $filter: {
            input: '$gameStats',
            as: 'gs',
            cond: { $eq: ['$$gs.gameId', new mongoose.Types.ObjectId(selectedGameId)] }
          }
        }
      }
    },
    { $unwind: '$gameStat' },
    { $sort: { 'gameStat.eloRating': -1 } },
    { $limit: 50 }
  ]);

  // 2. Sector Stats
  const stats = {
    totalMatches: await Match.countDocuments({ gameId: selectedGameId, status: 'completed' }),
    totalPlayers: topPlayers.length,
    aiVerifications: await Match.countDocuments({ gameId: selectedGameId, 'finalOutcome.resolvedBy': 'ai' }),
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
        games={JSON.parse(JSON.stringify(games))} 
        initialPlayers={JSON.parse(JSON.stringify(topPlayers))}
        selectedGameId={selectedGameId}
        stats={stats}
      />
    </div>
  );
}
