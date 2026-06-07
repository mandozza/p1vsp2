import dbConnect from '@/lib/db';
import { Match } from '@/models/Match';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Gavel, Shield, Info, Users, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { TribunalVoteForm } from '@/components/custom/TribunalVoteForm';

export default async function DisputeDetailsPage({ params }: { params: { id: string } }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const match = await Match.findById(params.id)
    .populate('challengerId', 'username stats eloRating')
    .populate('defenderId', 'username stats eloRating')
    .populate('gameId', 'title')
    .lean();

  if (!match || match.status !== 'disputed') notFound();

  // Calculate current vote tally
  const challengerVotes = match.votes.filter((v: any) => v.votedForId.toString() === match.challengerId._id.toString()).length;
  const defenderVotes = match.votes.filter((v: any) => v.votedForId.toString() === match.defenderId._id.toString()).length;
  const totalVotes = match.votes.length;

  const userVote = match.votes.find((v: any) => v.userId.toString() === session?.user?.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-neon-purple/20 bg-neon-purple/5 px-4 py-1.5 mb-4">
            <Gavel className="h-4 w-4 text-neon-purple" />
            <span className="text-xs font-black uppercase tracking-widest text-neon-purple">Tribunal Case #{match._id.toString().slice(-6)}</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white text-glow-pink">
            Review <span className="text-neon-pink">Evidence</span>
          </h1>
        </div>

        <div className="flex items-center space-x-8 rounded-2xl border border-white/5 bg-white/5 px-6 py-4">
           <VoteStat label={match.challengerId.username} count={challengerVotes} total={totalVotes} color="cyan" />
           <div className="h-8 w-px bg-white/10" />
           <VoteStat label={match.defenderId.username} count={defenderVotes} total={totalVotes} color="pink" />
        </div>
      </div>

      {/* Evidence Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {match.results.map((result: any, i: number) => {
          const isChallenger = result.userId.toString() === match.challengerId._id.toString();
          const player = isChallenger ? match.challengerId : match.defenderId;
          
          return (
            <div key={i} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className={cn(
                     "rounded-lg p-2 border",
                     isChallenger ? "bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan" : "bg-neon-pink/10 border-neon-pink/20 text-neon-pink"
                   )}>
                     <Shield className="h-4 w-4" />
                   </div>
                   <h3 className="text-lg font-black uppercase italic text-white tracking-tighter">
                     {player.username}&apos;s Proof
                   </h3>
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  AI Extraction: {result.aiExtractedData?.winnerTag || 'Inconclusive'}
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 group">
                <Image 
                  src={result.screenshotUrl} 
                  alt="Evidence" 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105" 
                />
                <a 
                  href={result.screenshotUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 rounded-lg bg-black/60 backdrop-blur-md p-2 text-white/60 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex items-start space-x-3">
                 <Info className="h-4 w-4 text-white/20 shrink-0 mt-0.5" />
                 <div className="text-[10px] font-bold text-white/40 uppercase leading-relaxed tracking-widest">
                   Claimed Winner: <span className="text-white">{result.aiExtractedData?.winnerTag || 'Unknown'}</span> • 
                   Method: <span className="text-white">{result.aiExtractedData?.method || 'Unknown'}</span> • 
                   Round: <span className="text-white">{result.aiExtractedData?.round || '?'}</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voting Action */}
      <div className="mt-12">
        {userVote ? (
          <div className="rounded-3xl border border-neon-purple/20 bg-neon-purple/5 p-8 text-center backdrop-blur-xl">
             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
               <Users className="h-6 w-6" />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Vote Recorded</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
               You voted for <span className="text-neon-purple">{(match as any)[userVote.votedForId.toString() === match.challengerId._id.toString() ? 'challengerId' : 'defenderId'].username}</span>
             </p>
          </div>
        ) : (
          <TribunalVoteForm 
            matchId={match._id.toString()} 
            challengerId={match.challengerId._id.toString()}
            defenderId={match.defenderId._id.toString()}
            challengerName={match.challengerId.username}
            defenderName={match.defenderId.username}
          />
        )}
      </div>
    </div>
  );
}

function VoteStat({ label, count, total, color }: { label: string; count: number; total: number; color: 'cyan' | 'pink' }) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  
  return (
    <div className="flex flex-col items-center">
      <span className={cn(
        "text-[8px] font-black uppercase tracking-widest mb-1",
        color === 'cyan' ? 'text-neon-cyan' : 'text-neon-pink'
      )}>{label}</span>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-black italic text-white">{count}</span>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">({percentage}%)</span>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
