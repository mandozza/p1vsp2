'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Swords, Zap, Shield, Crown, Medal, TrendingUp, Activity, ShieldCheck, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LeaderboardClient({ 
  games, 
  initialPlayers, 
  selectedGameId, 
  stats 
}: { 
  games: any[]; 
  initialPlayers: any[]; 
  selectedGameId: string;
  stats: any;
}) {
  const router = useRouter();

  const handleGameSelect = (id: string) => {
    router.push(`/leaderboard?gameId=${id}`);
  };

  return (
    <div className="space-y-12">
      {/* Game Selector */}
      <div className="flex flex-wrap gap-4 items-center justify-center p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl">
         <div className="flex items-center space-x-2 mr-4">
            <LayoutGrid className="h-4 w-4 text-neon-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Arena</span>
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

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-6 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Rank / Player</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sector ELO</span>
          </div>

          <div className="space-y-3">
            {initialPlayers.length > 0 ? (
              initialPlayers.map((player: any, index: number) => (
                <LeaderboardRow 
                  key={player._id.toString()} 
                  player={player} 
                  rank={index + 1} 
                />
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-white/5 py-20 text-center">
                 <Trophy className="h-10 w-10 text-white/10 mx-auto mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No recorded bouts in this arena</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-8 flex items-center space-x-2">
                 <Activity className="h-4 w-4 text-neon-cyan" />
                 <span>Arena Intelligence</span>
              </h3>
              
              <div className="grid gap-6">
                 <StatCard label="Arena Bouts" value={stats.totalMatches} icon={Swords} color="pink" />
                 <StatCard label="AI Verifications" value={stats.aiVerifications} icon={Zap} color="purple" />
                 <StatCard label="Ranked Players" value={stats.totalPlayers} icon={Shield} color="cyan" />
              </div>
           </section>

           <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-8 flex items-center space-x-2">
                 <Medal className="h-4 w-4 text-yellow-500" />
                 <span>Arena Rules</span>
              </h3>
              <ul className="space-y-4 text-[9px] font-bold text-white/40 uppercase leading-relaxed">
                 <li className="flex items-start space-x-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-pink mt-1 shrink-0" />
                    <span>ELO is calculated independently for every game protocol.</span>
                 </li>
                 <li className="flex items-start space-x-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan mt-1 shrink-0" />
                    <span>You must be a Verified Operator to reach the Top 10.</span>
                 </li>
              </ul>
           </section>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ player, rank }: { player: any; rank: number }) {
  const isTopThree = rank <= 3;
  
  return (
    <Link 
      href={`/profile/${player.username}`}
      className={cn(
        "group flex items-center justify-between rounded-2xl border px-6 py-4 transition-all hover:scale-[1.02] active:scale-95",
        isTopThree 
          ? "bg-neon-pink/5 border-neon-pink/20 shadow-[0_0_20px_rgba(255,0,255,0.05)]" 
          : "bg-white/5 border-white/10"
      )}
    >
      <div className="flex items-center space-x-6">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl font-black italic",
          rank === 1 ? "bg-yellow-500 text-black glow-yellow" :
          rank === 2 ? "bg-slate-300 text-black" :
          rank === 3 ? "bg-amber-600 text-black" :
          "bg-white/5 text-white/40 border border-white/10"
        )}>
          {rank}
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
             <h3 className="text-lg font-black uppercase italic text-white tracking-tight group-hover:text-neon-pink transition-colors">
               {player.username}
             </h3>
             {player.verificationStatus === 'verified' && (
               <ShieldCheck className="h-3 w-3 text-neon-cyan" />
             )}
          </div>
          <div className="flex items-center space-x-3 mt-0.5">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
              W: {player.gameStat.stats.wins} / L: {player.gameStat.stats.losses}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end space-x-2">
           <TrendingUp className="h-3 w-3 text-neon-cyan" />
           <span className="text-2xl font-black italic text-white tracking-tighter">
             {player.gameStat.eloRating}
           </span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-neon-cyan/40">Points</span>
      </div>
    </Link>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors: any = {
    pink: "text-neon-pink bg-neon-pink/10 border-neon-pink/20",
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
  };

  return (
    <div className={cn("rounded-2xl border p-4 flex items-center justify-between", colors[color])}>
       <div>
          <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</div>
          <div className="text-xl font-black italic text-white">{value.toLocaleString()}</div>
       </div>
       <div className="p-2 rounded-lg bg-white/5">
          <Icon className="h-4 w-4" />
       </div>
    </div>
  );
}
