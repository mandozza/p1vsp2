import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Game } from '@/models/Game';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trophy, Swords, Zap, Shield } from 'lucide-react';
import { ChallengeButton } from '@/components/custom/ChallengeButton';

export default async function PlayersPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  const players = await User.find({ 
    _id: { $ne: session?.user?.id } 
  }).sort({ eloRating: -1 }).lean();

  const ufcGame = await Game.findOne({ slug: 'ufc-6' });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Active <span className="text-neon-pink">Players</span>
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/30">
          Challenge the best to climb the global leaderboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {players.map((player: any) => (
          <div 
            key={player._id.toString()} 
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-neon-pink/30 hover:bg-white/10"
          >
            {/* Player Info */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center border border-white/10">
                <span className="text-xl font-black text-white uppercase italic">
                  {player.username[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{player.username}</h3>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-3 w-3 text-neon-cyan" />
                  <span className="text-xs font-black text-neon-cyan uppercase tracking-widest">
                    Rank: {player.eloRating} ELO
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <StatBox label="Wins" value={player.stats.wins} color="cyan" />
              <StatBox label="Losses" value={player.stats.losses} color="pink" />
              <StatBox label="Quits (DNF)" value={player.stats.dnfs} color="red" />
              <StatBox label="Win Rate" value={`${Math.round((player.stats.wins / (player.stats.wins + player.stats.losses || 1)) * 100)}%`} color="purple" />
            </div>

            {/* Challenge Action */}
            <ChallengeButton 
              defenderId={player._id.toString()} 
              gameId={ufcGame?._id.toString() || ''} 
              defenderName={player.username}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: any; color: string }) {
  const colorMap: any = {
    cyan: "text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5",
    pink: "text-neon-pink border-neon-pink/20 bg-neon-pink/5",
    red: "text-red-500 border-red-500/20 bg-red-500/5",
    purple: "text-neon-purple border-neon-purple/20 bg-neon-purple/5",
  };

  return (
    <div className={`rounded-lg border p-2 text-center ${colorMap[color]}`}>
      <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">{label}</div>
      <div className="text-sm font-black italic uppercase">{value}</div>
    </div>
  );
}
