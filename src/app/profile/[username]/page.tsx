import { db } from '@/lib/db';
import { User } from '@/models/User';
import { Match } from '@/models/Match';
import { Game } from '@/models/Game';
import { notFound } from 'next/navigation';
import { Trophy, Swords, Zap, Shield, Target, Activity, ShieldCheck, Gavel, Flame, Crown, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getUserAchievements } from '@/actions/achievement.actions';
import { getUserRivalries } from '@/actions/rivalry.actions';
import { ACHIEVEMENTS } from '@/lib/achievements.config';
import { CombatAnalyst } from '@/components/custom/CombatAnalyst';
import { VerificationSector } from '@/components/custom/VerificationSector';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eq, and, or, desc } from 'drizzle-orm';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);

  // 1. Fetch user
  const [rawUser] = await db.select().from(User).where(eq(User.username, params.username));
  if (!rawUser) notFound();

  // 2. Fetch all games to populate gameStats details in memory
  const allGames = await db.select().from(Game);
  const gamesMap = new Map(allGames.map((g: any) => [String(g.id), { _id: g.id, id: g.id, title: g.title }]));

  const populatedGameStats = rawUser.gameStats?.map((gs: any) => {
    const g = gamesMap.get(String(gs.gameId));
    return {
      ...gs,
      gameId: g || { _id: gs.gameId, id: gs.gameId, title: 'Unknown Game' }
    };
  }) || [];

  const user = {
    ...rawUser,
    _id: rawUser.id,
    id: rawUser.id,
    gameStats: populatedGameStats
  };

  const [achievements, rivalries] = await Promise.all([
    getUserAchievements(user.id),
    getUserRivalries(user.id),
  ]);

  const isOwner = session?.user?.id === user.id;

  // 3. Fetch match history (last 10 completed matches)
  const rawMatchHistory = await db.query.matches.findMany({
    where: and(
      or(eq(Match.challengerId, user.id), eq(Match.defenderId, user.id)),
      eq(Match.status, 'completed')
    ),
    orderBy: [desc(Match.updatedAt)],
    limit: 10,
    with: {
      challenger: {
        columns: {
          username: true,
        }
      },
      defender: {
        columns: {
          username: true,
        }
      },
      game: {
        columns: {
          title: true,
        }
      }
    }
  });

  const matchHistory = rawMatchHistory.map((m: any) => ({
    ...m,
    _id: m.id,
    id: m.id,
    challengerId: m.challenger ? { _id: m.challengerId, username: m.challenger.username } : { _id: '', username: 'Unknown' },
    defenderId: m.defender ? { _id: m.defenderId, username: m.defender.username } : { _id: '', username: 'Unknown' },
    gameId: m.game ? { _id: m.gameId, title: m.game.title } : { _id: '', title: 'Unknown Game' },
  }));


  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl mb-12">
        {/* Banner */}
        <div className="absolute inset-0 h-48 w-full overflow-hidden">
           {user.bannerUrl ? (
             <Image src={user.bannerUrl} alt="Banner" fill className="object-cover opacity-40" />
           ) : (
             <div className="h-full w-full bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-arcade-black to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 p-8 pt-24 md:pt-32">
          <div className="h-32 w-32 rounded-3xl bg-neon-pink p-1 glow-pink">
             <div className="h-full w-full rounded-2xl bg-arcade-black flex items-center justify-center relative overflow-hidden">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserIcon className="h-16 w-16 text-white/20" />
                )}
             </div>
          </div>

          <div className="flex-1 text-center md:text-left">
             <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                  {user.name}
                </h2>
                {user.verificationStatus === 'verified' && (
                  <div className="inline-flex self-center md:self-auto items-center space-x-1.5 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-1 shadow-[0_0_10px_rgba(0,255,255,0.05)]">
                     <ShieldCheck className="h-3.5 w-3.5 text-neon-cyan" />
                     <span className="text-[8px] font-black uppercase tracking-widest text-neon-cyan">Verified Operator</span>
                  </div>
                )}
             </div>
             <p className="text-neon-pink text-xs font-bold uppercase tracking-widest mt-1">@{user.username}</p>
             {user.bio && <p className="mt-4 text-xs text-white/50 max-w-xl font-bold uppercase tracking-wider">{user.bio}</p>}
          </div>

          <div className="flex items-center space-x-6 bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
             <div className="text-center">
                <span className="text-[6px] font-black uppercase tracking-widest text-white/30">ELITE RATING</span>
                <p className="text-3xl font-black italic text-white tracking-tighter mt-1">{user.eloRating}</p>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div className="text-center">
                <span className="text-[6px] font-black uppercase tracking-widest text-white/30">SCORE MATRIX</span>
                <p className="text-xl font-black italic text-white mt-1">
                  W {user.stats.wins} <span className="text-white/25">/</span> L {user.stats.losses}
                </p>
             </div>
          </div>
        </div>
      </div>

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
                 <RepStat label="Disputes Unresolved" value={String(user.stats.dnfs || 0)} />
                 <RepStat label="Verification Status" value={user.verificationStatus.toUpperCase()} />
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
                     const isP1 = r.player1Id._id.toString() === user.id.toString();
                     const rival = isP1 ? r.player2Id : r.player1Id;
                     const userWins = isP1 ? r.stats.player1Wins : r.stats.player2Wins;
                     const rivalWins = isP1 ? r.stats.player2Wins : r.stats.player1Wins;
                     const hasBelt = r.beltHolderId?.toString() === user.id.toString();

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
        </div>

        {/* Right Column: Dynamic Combat Analyst & Match History */}
        <div className="lg:col-span-2 space-y-8">
           {/* Combat Analyst */}
           <CombatAnalyst 
             username={user.username}
           />

           {/* Match History */}
           <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex items-center space-x-3 mb-8">
                 <div className="rounded-lg bg-neon-cyan/10 p-2 text-neon-cyan border border-neon-cyan/20">
                    <Swords className="h-5 w-5" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Combat Record</h3>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Recent verified confrontations</p>
                 </div>
              </div>

              {matchHistory.length > 0 ? (
                <div className="space-y-4">
                  {matchHistory.map((m: any) => {
                    const won = m.finalOutcome.winnerId._id.toString() === user.id.toString();
                    const opponent = m.challengerId._id.toString() === user.id.toString() ? m.defenderId : m.challengerId;

                    return (
                      <Link 
                        key={m._id} 
                        href={`/matches/${m.id}`}
                        className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-white/5 bg-arcade-black/40 hover:border-white/10 transition-all gap-4"
                      >
                         <div className="flex items-center space-x-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black italic border",
                              won ? "bg-neon-pink/10 text-neon-pink border-neon-pink/20 glow-pink" : "bg-white/5 text-white/20 border-white/10"
                            )}>
                              {won ? 'W' : 'L'}
                            </div>
                            <div>
                               <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors">
                                 {won ? 'Defeated' : 'Lost to'} {opponent.username}
                               </p>
                               <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                                 {m.gameId.title} • {m.finalOutcome.method}
                               </p>
                            </div>
                         </div>
                         <div className="text-left md:text-right">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Resolved</span>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mt-0.5">
                              {m.finalOutcome.resolvedAt ? new Date(m.finalOutcome.resolvedAt).toLocaleDateString() : 'N/A'}
                            </span>
                         </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/5 py-12 text-center">
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">No engagements recorded</p>
                </div>
              )}
           </section>
        </div>
      </div>
    </div>
  );
}

function RepStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
      <span className="text-xs font-black italic text-white uppercase tracking-tight">{value}</span>
    </div>
  );
}
