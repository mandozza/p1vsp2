import dbConnect from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Trophy, Users, Swords, Crown, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TournamentRegisterButton } from '@/components/custom/TournamentRegisterButton';

export default async function TournamentDetailsPage({ params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const tournament = await Tournament.findById(params.id)
    .populate('gameId', 'title')
    .populate({
      path: 'rounds.matches',
      populate: { path: 'challengerId defenderId finalOutcome.winnerId', select: 'username' }
    })
    .populate('championId', 'username')
    .lean();

  if (!tournament) notFound();

  const isRegistered = tournament.participants.some(p => p.toString() === session?.user?.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="inline-flex items-center space-x-2 rounded-full border border-neon-pink/20 bg-neon-pink/5 px-4 py-1.5 mb-6">
             <Trophy className="h-4 w-4 text-neon-pink" />
             <span className="text-xs font-black uppercase tracking-widest text-neon-pink">{tournament.gameId.title} Tournament</span>
           </div>
           <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white text-glow-pink">
             {tournament.name}
           </h1>
        </div>

        {tournament.status === 'registration' && (
          <TournamentRegisterButton tournamentId={tournament._id.toString()} isRegistered={isRegistered} />
        )}

        {tournament.status === 'completed' && tournament.championId && (
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6 backdrop-blur-xl flex items-center space-x-6">
             <div className="h-16 w-16 rounded-2xl bg-yellow-500 flex items-center justify-center glow-yellow shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <Crown className="h-8 w-8 text-black" />
             </div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60">Grand Champion</span>
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
                  {tournament.championId.username}
                </h2>
             </div>
          </div>
        )}
      </div>

      {/* Bracket Grid */}
      <div className="grid gap-12">
        {tournament.rounds.length > 0 ? (
          <div className="flex flex-col md:flex-row items-start gap-12 overflow-x-auto pb-12">
             {tournament.rounds.map((round: any, roundIndex: number) => (
               <div key={roundIndex} className="flex-1 min-w-[300px] space-y-8">
                  <div className="flex items-center space-x-4 mb-10">
                     <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs italic text-white/40">
                        {round.roundNumber}
                     </div>
                     <h3 className="text-xl font-black uppercase italic text-white/60 tracking-widest">
                        {roundIndex === tournament.rounds.length - 1 ? 'Grand Finals' : `Round ${round.roundNumber}`}
                     </h3>
                  </div>

                  <div className="space-y-6">
                     {round.matches.map((match: any) => (
                       <MatchNode key={match._id.toString()} match={match} />
                     ))}
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-white/5 py-32 text-center backdrop-blur-xl">
             <Users className="h-12 w-12 text-white/10 mx-auto mb-4" />
             <h3 className="text-xl font-black uppercase tracking-widest text-white/20 italic">Awaiting Entrants</h3>
             <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/10">The bracket will materialize once the portal opens.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchNode({ match }: { match: any }) {
  const isCompleted = match.status === 'completed';
  const winnerId = match.finalOutcome?.winnerId?._id?.toString();

  return (
    <div className="relative group">
       <div className={cn(
         "rounded-2xl border transition-all p-4",
         isCompleted ? "bg-white/[0.02] border-white/10" : "bg-neon-purple/5 border-neon-purple/20 shadow-[0_0_20px_rgba(188,19,254,0.05)]"
       )}>
          <div className="space-y-2">
             <PlayerRow 
               player={match.challengerId} 
               isWinner={winnerId === match.challengerId?._id?.toString()} 
               isLoser={isCompleted && winnerId !== match.challengerId?._id?.toString()}
             />
             <div className="h-px bg-white/5" />
             <PlayerRow 
               player={match.defenderId} 
               isWinner={winnerId === match.defenderId?._id?.toString()} 
               isLoser={isCompleted && winnerId !== match.defenderId?._id?.toString()}
             />
          </div>

          {!isCompleted && (
            <Link 
              href={`/matches/${match._id}`}
              className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 py-2 text-[8px] font-black uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all"
            >
              <span>Go to Match</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
       </div>
    </div>
  );
}

function PlayerRow({ player, isWinner, isLoser }: { player: any; isWinner: boolean; isLoser: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-2 py-1 rounded-lg transition-all",
      isWinner && "bg-neon-pink/10",
      isLoser && "opacity-30 grayscale"
    )}>
       <div className="flex items-center space-x-3">
          <div className={cn(
            "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black italic border",
            isWinner ? "bg-neon-pink text-white border-neon-pink glow-pink" : "bg-white/5 text-white/20 border-white/10"
          )}>
            {player?.username?.[0] || '?'}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isWinner ? "text-neon-pink" : "text-white/60"
          )}>
            {player?.username || 'TBD'}
          </span>
       </div>
       {isWinner && <Star className="h-3 w-3 text-neon-pink fill-neon-pink" />}
    </div>
  );
}
