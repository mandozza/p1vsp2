import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trophy, Swords, Zap, Shield, LayoutGrid } from 'lucide-react';
import { PlayersClient } from '@/components/custom/PlayersClient';
import mongoose from 'mongoose';

export default async function PlayersPage({ searchParams }: { searchParams: { gameId?: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const games = await Game.find({ active: true }).sort({ title: 1 }).lean();
  const selectedGameId = searchParams.gameId || games[0]?._id?.toString();
  
  // Fetch players, sorting by the selected game's ELO (if they have it), otherwise global ELO
  const players = await User.aggregate([
    { 
      $match: { 
        role: 'member', 
        _id: { $ne: session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : null } 
      } 
    },
    {
      $addFields: {
        sectorStat: {
          $filter: {
            input: '$gameStats',
            as: 'gs',
            cond: { $eq: ['$$gs.gameId', new mongoose.Types.ObjectId(selectedGameId)] }
          }
        }
      }
    },
    {
      $sort: {
        'sectorStat.0.eloRating': -1,
        eloRating: -1
      }
    }
  ]);

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
        games={JSON.parse(JSON.stringify(games))} 
        selectedGameId={selectedGameId}
      />
    </div>
  );
}
