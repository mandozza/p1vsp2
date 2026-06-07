import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { notFound } from 'next/navigation';
import { Trophy, Swords, Zap, Shield, Target, Activity, ShieldCheck, Gavel, Flame, Crown } from 'lucide-react';
import Image from 'next/image';
import { getUserAchievements } from '@/actions/achievement.actions';
import { getUserRivalries } from '@/actions/rivalry.actions';
import { ACHIEVEMENTS } from '@/lib/achievements.config';
import { CombatAnalyst } from '@/components/custom/CombatAnalyst';
import { VerificationSector } from '@/components/custom/VerificationSector';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const user = await User.findOne({ username: params.username })
    .populate('gameStats.gameId', 'title')
    .lean();
  if (!user) notFound();

  const [achievements, rivalries] = await Promise.all([
    getUserAchievements(user._id.toString()),
    getUserRivalries(user._id.toString()),
  ]);

  const isOwner = session?.user?.id === user._id.toString();

  const matchHistory = await Match.find({
    $or: [{ challengerId: user._id }, { defenderId: user._id }],
    status: 'completed'
  })
  .populate('challengerId', 'username')
  .populate('defenderId', 'username')
  .populate('gameId', 'title')
  .sort({ updatedAt: -1 })
  .limit(10)
  .lean();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="h-32 w-32 rounded-3xl bg-neon-pink p-1 glow-pink">
             <div className="h-full w-full rounded-2xl bg-arcade-black flex items-center justify-center">
                <span className="text-5xl font-black text-white uppercase italic">{user.username[0]}</span>
             </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
               <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
                 {user.username}
               </h1>
               {user.verificationStatus === 'verified' && (
                 <div className="rounded-full bg-neon-cyan/20 p-1 border border-neon-cyan/30 glow-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                    <ShieldCheck className="h-4 w-4 text-neon-cyan" />
                 </div>
               )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <Badge icon={Shield} label={user.role === 'admin' ? 'Operator' : 'Member'} color="purple" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
             <ProfileStat label="Victories" value={user.stats.wins} color="pink" />
             <ProfileStat label="Defeats" value={user.stats.losses} color="white" />
          </div>
        </div>
      </div>

      <CombatAnalyst username={user.username} />

      {/* Sector Ratings */}
      {user.gameStats && user.gameStats.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-12">
           <div className="flex items-center space-x-3 mb-8">
              <div className="rounded-lg bg-neon-pink/10 p-2 text-neon-pink border border-neon-pink/20">
                 <Trophy className="h-5 w-5" />
              </div>
              <div>
                 <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Sector Ratings</h3>
                 <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Independent Performance Metrics</p>
              </div>
           </div>

           <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {user.gameStats.map((gs: any) => (
                <div key={gs.gameId?._id?.toString() || Math.random()} className="rounded-2xl border border-white/5 bg-arcade-black/40 p-5 flex items-center justify-between group hover:border-neon-cyan/30 transition-all">
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">{gs.gameId?.title || 'Unknown'}</p>
                      <p className="text-2xl font-black italic text-white tracking-tighter">{gs.eloRating}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[6px] font-bold text-white/10 uppercase tracking-widest">Win Rate</p>
                      <p className="text-[10px] font-black text-neon-cyan uppercase italic">
                        {Math.round((gs.stats.wins / (gs.stats.wins + gs.stats.losses || 1)) * 100)}%
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {isOwner && <VerificationSector user={JSON.parse(JSON.stringify(user))} />}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Stats & Reputation */}
        <div className="space-y-8">
           <section className="rounded-2xl border border-white/5 bg-arcade-black/40 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center space-x-2">
                 <Activity className="h-4 w-4 text-neon-cyan" />
                 <span>Reputation Matrix</span>
              </h3>
              <div className="space-y-4">
                 <RepStat label="Win Rate" value={`${Math.round((user.stats.wins / (user.stats.wins + user.stats.losses || 1)) * 100)}%`} />
                 <RepStat label="DNF (Quits)" value={user.stats.dnfs} isBad />
                 <RepStat label="Total Bouts" value={user.stats.wins + user.stats.losses + user.stats.draws} />
              </div>
           </section>

           {rivalries.length > 0 && (
             <section className="rounded-2xl border border-white/5 bg-arcade-black/40 p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center space-x-2">
                   <Flame className="h-4 w-4 text-orange-500" />
                   <span>Nemesis Watch</span>
                </h3>
                <div className="space-y-4">
                   {rivalries.map((r: any) => {
                     const isP1 = r.player1Id._id.toString() === user._id.toString();
                     const rival = isP1 ? r.player2Id : r.player1Id;
                     const userWins = isP1 ? r.stats.player1Wins : r.stats.player2Wins;
                     const rivalWins = isP1 ? r.stats.player2Wins : r.stats.player1Wins;
                     const hasBelt = r.beltHolderId?.toString() === user._id.toString();

                     return (
                       <div key={r._id.toString()} className="group rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-orange-500/30">
                          <div className="flex items-center justify-between mb-3">
                             <span className="text-[10px] font-black uppercase tracking-widest text-white">{rival.username}</span>
                             {hasBelt && (
                               <div className="flex items-center space-x-1 rounded-full bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20">
                                  <Crown className="h-2 w-2 text-yellow-500" />
                                  <span className="text-[6px] font-black uppercase text-yellow-500">Belt Holder</span>
                               </div>
                             )}
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex-1 text-center">
                                <p className="text-[6px] font-black uppercase text-white/20 mb-1">YOU</p>
                                <p className="text-xl font-black italic text-white leading-none">{userWins}</p>
                             </div>
                             <div className="px-4 text-[8px] font-black text-white/10 uppercase italic">VS</div>
                             <div className="flex-1 text-center">
                                <p className="text-[6px] font-black uppercase text-white/20 mb-1">THEM</p>
                                <p className="text-xl font-black italic text-white/40 leading-none">{rivalWins}</p>
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
             </section>
           )}

           <section className="rounded-2xl border border-white/5 bg-arcade-black/40 p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center space-x-2">
                 <Target className="h-4 w-4 text-neon-pink" />
                 <span>Achievements</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                 {Object.values(ACHIEVEMENTS).map(a => {
                   const isUnlocked = achievements.some((ua: any) => ua.achievementId === a.id);
                   return (
                     <AchievementBadge 
                       key={a.id} 
                       achievement={a} 
                       isUnlocked={isUnlocked} 
                     />
                   );
                 })}
              </div>
           </section>
        </div>

        {/* Right Column: Fight History */}
        <div className="lg:col-span-2">
           <section className="rounded-2xl border border-white/5 bg-arcade-black/40 p-8 h-full">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-8 flex items-center space-x-2">
                 <Swords className="h-4 w-4 text-neon-pink" />
                 <span>Fight History</span>
              </h3>

              {matchHistory.length > 0 ? (
                <div className="space-y-4">
                   {matchHistory.map((match: any) => {
                     const isWinner = match.finalOutcome.winnerId.toString() === user._id.toString();
                     const opponent = match.challengerId._id.toString() === user._id.toString() ? match.defenderId : match.challengerId;
                     
                     return (
                       <div key={match._id.toString()} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                          <div className="flex items-center space-x-4">
                             <div className={cn(
                               "rounded-lg px-3 py-1 text-[8px] font-black uppercase italic tracking-widest",
                               isWinner ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                             )}>
                               {isWinner ? 'Victory' : 'Defeat'}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-white uppercase tracking-tight">vs {opponent.username}</p>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{match.gameId.title} • {match.finalOutcome.method}</p>
                                {match.finalOutcome.commentary && (
                                  <p className="mt-1 text-[7px] font-black italic uppercase tracking-tighter text-neon-pink opacity-60 line-clamp-1 group-hover:opacity-100 transition-opacity max-w-[200px]">
                                    "{match.finalOutcome.commentary}"
                                  </p>
                                )}
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-white/40 uppercase italic tracking-tighter">
                               R{match.finalOutcome.round} • {match.finalOutcome.time}
                             </p>
                             <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">
                               {new Date(match.updatedAt).toLocaleDateString()}
                             </p>
                          </div>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                   <Swords className="h-12 w-12 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No match data recorded</p>
                </div>
              )}
           </section>
        </div>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement, isUnlocked }: { achievement: any; isUnlocked: boolean }) {
  const icons: any = {
    Swords: Swords,
    ShieldCheck: ShieldCheck,
    Gavel: Gavel,
    Trophy: Trophy,
    Zap: Zap,
  };
  const Icon = icons[achievement.icon] || Trophy;

  const colors: any = {
    pink: "text-neon-pink bg-neon-pink/10 border-neon-pink/20 glow-pink",
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20 glow-cyan",
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  };

  return (
    <div className={cn(
      "flex items-center space-x-3 rounded-xl border p-3 transition-all",
      isUnlocked ? `${colors[achievement.color]} bg-opacity-20 shadow-lg` : "bg-white/5 border-white/5 opacity-30 grayscale"
    )}>
       <div className={cn(
         "rounded-lg p-2 border",
         isUnlocked ? colors[achievement.color] : "bg-white/5 border-white/5"
       )}>
          <Icon className="h-4 w-4" />
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest leading-none">{achievement.name}</p>
          <p className="text-[7px] font-bold uppercase tracking-widest text-white/40 mt-1 line-clamp-1">{achievement.description}</p>
       </div>
       {!isUnlocked && (
         <Zap className="h-3 w-3 text-white/10" />
       )}
    </div>
  );
}

function Badge({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  const colors: any = {
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
  };

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full border px-3 py-1 ${colors[color]}`}>
       <Icon className="h-3 w-3" />
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ProfileStat({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-arcade-black/60 p-4 text-center min-w-[100px]">
       <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">{label}</div>
       <div className={cn(
         "text-2xl font-black italic uppercase tracking-tighter",
         color === 'pink' ? "text-neon-pink" : "text-white"
       )}>{value}</div>
    </div>
  );
}

function RepStat({ label, value, isBad }: { label: string; value: any; isBad?: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
       <span className={cn(
         "text-[10px] font-black uppercase tracking-tighter",
         isBad ? (value > 0 ? "text-red-500" : "text-white/40") : "text-white"
       )}>{value}</span>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
