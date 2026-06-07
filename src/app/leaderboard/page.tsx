import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { UserAchievement } from '@/models/UserAchievement';
import { Trophy, Swords, Zap, Shield, Crown, Medal, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function LeaderboardPage() {
  await dbConnect();

  // 1. Fetch Top 50 Players by ELO
  const topPlayers = await User.find({ role: 'member' })
    .sort({ eloRating: -1 })
    .limit(50)
    .lean();

  // 2. Fetch Achievement Counts for Hall of Fame
  const achievementStats = await UserAchievement.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // 3. Sector Stats
  const stats = {
    totalMatches: await Match.countDocuments({ status: 'completed' }),
    totalPlayers: await User.countDocuments({ role: 'member' }),
    aiVerifications: await Match.countDocuments({ 'finalOutcome.resolvedBy': 'ai' }),
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
          The single source of truth for elite console dominance. Verified by AI. Settled in the arena.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-6 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Rank / Player</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ELO Rating</span>
          </div>

          <div className="space-y-3">
            {topPlayers.map((player: any, index: number) => (
              <LeaderboardRow 
                key={player._id.toString()} 
                player={player} 
                rank={index + 1} 
              />
            ))}
          </div>
        </div>

        {/* Sidebar: Sector Intelligence */}
        <div className="space-y-8">
           <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-8 flex items-center space-x-2">
                 <Activity className="h-4 w-4 text-neon-cyan" />
                 <span>Sector Intelligence</span>
              </h3>
              
              <div className="grid gap-6">
                 <StatCard label="Total Bouts" value={stats.totalMatches} icon={Swords} color="pink" />
                 <StatCard label="AI Verifications" value={stats.aiVerifications} icon={Zap} color="purple" />
                 <StatCard label="Active Operators" value={stats.totalPlayers} icon={Shield} color="cyan" />
              </div>
           </section>

           <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-8 flex items-center space-x-2">
                 <Medal className="h-4 w-4 text-yellow-500" />
                 <span>Hall of Fame</span>
              </h3>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed mb-6">
                 Players with the highest achievement density in the sector.
              </p>
              
              <div className="space-y-4 opacity-40">
                 <div className="flex items-center justify-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest">Recalculating density...</span>
                 </div>
              </div>
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
          <h3 className="text-lg font-black uppercase italic text-white tracking-tight group-hover:text-neon-pink transition-colors">
            {player.username}
          </h3>
          <div className="flex items-center space-x-3 mt-0.5">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
              W: {player.stats.wins} / L: {player.stats.losses}
            </span>
            {player.stats.dnfs > 0 && (
              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                {player.stats.dnfs} DNF
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end space-x-2">
           <TrendingUp className="h-3 w-3 text-neon-cyan" />
           <span className="text-2xl font-black italic text-white tracking-tighter">
             {player.eloRating}
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
