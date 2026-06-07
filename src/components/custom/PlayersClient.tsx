'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Swords, LayoutGrid } from 'lucide-react';
import { ChallengeButton } from '@/components/custom/ChallengeButton';
import { cn } from '@/lib/utils';

export function PlayersClient({ 
  initialPlayers, 
  games, 
  selectedGameId 
}: { 
  initialPlayers: any[]; 
  games: any[]; 
  selectedGameId: string;
}) {
  const router = useRouter();

  const handleGameSelect = (id: string) => {
    router.push(`/players?gameId=${id}`);
  };

  return (
    <div className="space-y-12">
      {/* Game Selector */}
      <div className="flex flex-wrap gap-4 items-center p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl">
         <div className="flex items-center space-x-2 mr-4">
            <LayoutGrid className="h-4 w-4 text-neon-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Sector</span>
         </div>
         {games.map((game) => (
           <button
             key={game._id}
             onClick={() => handleGameSelect(game._id)}
             className={cn(
               "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
               selectedGameId === game._id 
                 ? "bg-neon-cyan text-black border-neon-cyan glow-cyan" 
                 : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
             )}
           >
             {game.title}
           </button>
         ))}
      </div>

      {/* Players Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialPlayers.map((player: any) => {
          const sectorStat = player.gameStats?.find((gs: any) => gs.gameId.toString() === selectedGameId);
          const displayElo = sectorStat?.eloRating || player.eloRating;
          const wins = sectorStat?.stats?.wins ?? player.stats.wins;
          const losses = sectorStat?.stats?.losses ?? player.stats.losses;
          const dnfs = sectorStat?.stats?.dnfs ?? player.stats.dnfs;

          return (
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
                      Rank: {displayElo} ELO
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <StatBox label="Wins" value={wins} color="cyan" />
                <StatBox label="Losses" value={losses} color="pink" />
                <StatBox label="Quits (DNF)" value={dnfs} color="red" />
                <StatBox label="Win Rate" value={`${Math.round((wins / (wins + losses || 1)) * 100)}%`} color="purple" />
              </div>

              {/* Challenge Action */}
              <ChallengeButton 
                defenderId={player._id.toString()} 
                gameId={selectedGameId} 
                defenderName={player.username}
              />
            </div>
          );
        })}
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
