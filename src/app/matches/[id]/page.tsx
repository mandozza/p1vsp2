import { db } from '@/lib/db';
import { Match } from '@/models/Match';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Camera, Shield, User, Trophy, Swords, AlertCircle, Coins, Zap } from 'lucide-react';
import { ResultUploader } from '@/components/custom/ResultUploader';
import { OraclePrediction } from '@/components/custom/OraclePrediction';
import { SideBetForm } from '@/components/custom/SideBetForm';
import { Bet } from '@/models/Bet';
import Image from 'next/image';
import Link from 'next/link';
import { eq, and } from 'drizzle-orm';

export default async function MatchDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const rawMatch = await db.query.matches.findFirst({
    where: eq(Match.id, params.id),
    with: {
      challenger: {
        columns: {
          id: true,
          username: true,
          stats: true,
          eloRating: true,
        }
      },
      defender: {
        columns: {
          id: true,
          username: true,
          stats: true,
          eloRating: true,
        }
      },
      game: {
        columns: {
          title: true,
        }
      }
    }
  });

  if (!rawMatch) notFound();

  const match = {
    ...rawMatch,
    _id: rawMatch.id,
    id: rawMatch.id,
    challengerId: rawMatch.challenger ? { ...rawMatch.challenger, _id: rawMatch.challenger.id } : { _id: '', username: 'Unknown', stats: { wins: 0, losses: 0, draws: 0, dnfs: 0 }, eloRating: 1000 },
    defenderId: rawMatch.defender ? { ...rawMatch.defender, _id: rawMatch.defender.id } : { _id: '', username: 'Unknown', stats: { wins: 0, losses: 0, draws: 0, dnfs: 0 }, eloRating: 1000 },
    gameId: rawMatch.game ? { title: rawMatch.game.title } : { title: 'Unknown Game' },
  };

  const isChallenger = match.challengerId._id.toString() === session.user.id;
  const isDefender = match.defenderId._id.toString() === session.user.id;
  
  const userResult = match.results.find((r: any) => r.userId.toString() === session.user.id);
  const opponentResult = match.results.find((r: any) => r.userId.toString() !== session.user.id);

  const [dbBet] = await db
    .select()
    .from(Bet)
    .where(and(eq(Bet.matchId, params.id), eq(Bet.userId, session.user.id)));

  const existingBet = dbBet ? { ...dbBet, _id: dbBet.id } : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-1.5 mb-6">
          <Swords className="h-4 w-4 text-neon-cyan" />
          <span className="text-xs font-black uppercase tracking-widest text-neon-cyan">{match.gameId.title}</span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow-pink">
          Match <span className="text-neon-pink">Verification</span>
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Versus Players */}
        <PlayerProfile player={match.challengerId} label="Challenger" />
        <PlayerProfile player={match.defenderId} label="Defender" />
      </div>

      {/* Oracle Prediction */}
      <div className="mt-12">
         <OraclePrediction 
           prediction={match.prediction} 
           challengerName={match.challengerId.username} 
           defenderName={match.defenderId.username} 
         />
      </div>

      {/* Action Zone */}
      <div className="mt-12">
        {match.status === 'accepted' || match.status === 'awaiting_results' ? (
          <div className="grid gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl h-full">
                   {userResult ? (
                     <div className="text-center">
                       <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                         <Shield className="h-10 w-10" />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">Proof Secured</h3>
                       <p className="text-sm font-bold uppercase tracking-widest text-white/30 mb-8">
                         Your screenshot is in the system. {opponentResult ? 'Verifying results...' : 'Waiting for opponent submission.'}
                       </p>
                       <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-white/10">
                         <Image 
                           src={userResult.screenshotUrl} 
                           alt="Submission proof" 
                           fill 
                           className="object-cover opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-zoom-in animate-fade-in" 
                         />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white">Your Submission</span>
                         </div>
                       </div>
                     </div>
                   ) : isChallenger || isDefender ? (
                     <div className="space-y-8">
                       <div className="text-center">
                         <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">Upload Proof</h3>
                         <p className="text-sm font-bold uppercase tracking-widest text-white/30">
                           Upload a high-quality screenshot of the final score screen to verify your win.
                         </p>
                       </div>
                       
                       <ResultUploader matchId={match.id} />
                       
                       <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4 flex items-start space-x-3">
                         <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                         <p className="text-[10px] font-bold text-yellow-500/80 uppercase leading-relaxed">
                           Make sure the gamer tags and final scores are clearly visible. Fake submissions or low-quality images may result in a reputation penalty.
                         </p>
                       </div>
                     </div>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <Swords className="h-12 w-12 text-white/10 mb-4" />
                          <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Arena in Progress</h3>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 max-w-xs">
                            The combatants are in the arena. Watch the live ticker for the resolution.
                          </p>
                       </div>
                    )}
                </div>
             </div>
             
             <div>
                {!existingBet && !isChallenger && !isDefender ? (
                   <SideBetForm 
                     matchId={match.id} 
                     challenger={{ id: match.challengerId._id.toString(), username: match.challengerId.username }}
                     defender={{ id: match.defenderId._id.toString(), username: match.defenderId.username }}
                   />
                ) : existingBet ? (
                   <div className="rounded-3xl border border-neon-cyan/20 bg-neon-cyan/5 p-8 text-center h-full flex flex-col items-center justify-center backdrop-blur-xl animate-scale-up">
                      <div className="rounded-2xl bg-neon-cyan/10 p-4 mb-4 border border-neon-cyan/20">
                         <Coins className="h-8 w-8 text-neon-cyan" />
                      </div>
                      <h3 className="text-xl font-black uppercase italic text-white mb-2">Bet Locked</h3>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                        You backed <span className="text-white">{(match as any)[existingBet.votedForId.toString() === match.challengerId._id.toString() ? 'challengerId' : 'defenderId'].username}</span> for <span className="text-neon-cyan">{existingBet.amount} credits</span>.
                      </p>
                   </div>
                ) : (
                   <div className="rounded-3xl border border-white/5 bg-white/5 p-8 text-center h-full flex flex-col items-center justify-center opacity-20">
                      <Shield className="h-10 w-10 mb-4" />
                      <p className="text-[8px] font-black uppercase tracking-widest">Participants cannot place side-bets</p>
                   </div>
                )}
             </div>
          </div>
        ) : match.status === 'verifying' ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20 animate-pulse">
              <Shield className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">AI Processing</h3>
            <p className="text-sm font-bold uppercase tracking-widest text-white/30">
              Gemini is currently analyzing the screenshots from both players to confirm the outcome.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
             <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-pink/10 text-neon-pink border border-neon-pink/20 glow-pink">
                <Zap className="h-8 w-8" />
             </div>
             
             {match.finalOutcome?.commentary && (
               <div className="mb-8 relative">
                 <div className="absolute -top-4 -left-2 text-4xl text-white/5 font-serif italic">&ldquo;</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white text-glow-pink px-6">
                   {match.finalOutcome.commentary}
                 </h2>
                 <div className="absolute -bottom-4 -right-2 text-4xl text-white/5 font-serif italic">&rdquo;</div>
               </div>
             )}

              <div className="flex flex-col items-center space-y-4">
                 <div className="flex items-center space-x-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
                    <Shield className="h-3 w-3 text-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      Verified by {match.finalOutcome?.resolvedBy?.toUpperCase()} Oracle
                    </span>
                 </div>
                 
                 <Link href="/matches" className="text-neon-cyan text-[10px] font-black uppercase tracking-widest hover:underline">
                   Back to Match Center
                 </Link>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerProfile({ player, label }: { player: any; label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-arcade-black/40 p-6">
      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">{label}</div>
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <User className="h-6 w-6 text-white/40" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">{player.username}</h3>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-1">
              <Trophy className="h-3 w-3 text-neon-cyan" />
              <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">{player.eloRating} ELO</span>
            </div>
            <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
              W: {player.stats.wins} / L: {player.stats.losses}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
