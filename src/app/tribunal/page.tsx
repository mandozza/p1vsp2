import { db } from '@/lib/db';
import { Match } from '@/models/Match';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Gavel, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { eq, desc } from 'drizzle-orm';

export default async function TribunalPage() {
  const session = await getServerSession(authOptions);

  const rawDisputes = await db.query.matches.findMany({
    where: eq(Match.status, 'disputed'),
    orderBy: [desc(Match.createdAt)],
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

  const disputes = rawDisputes.map((m: any) => ({
    ...m,
    _id: m.id,
    id: m.id,
    challengerId: m.challenger ? { username: m.challenger.username } : { username: 'Unknown' },
    defenderId: m.defender ? { username: m.defender.username } : { username: 'Unknown' },
    gameId: m.game ? { title: m.game.title } : { title: 'Unknown Game' },
  }));


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Community <span className="text-neon-purple">Tribunal</span>
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/30">
          Review evidence and vote to resolve match disputes
        </p>
      </div>

      {disputes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {disputes.map((match: any) => (
            <Link 
              key={match.id}
              href={`/tribunal/${match.id}`}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-neon-purple/30 hover:bg-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="rounded-lg bg-neon-purple/10 p-1.5 text-neon-purple border border-neon-purple/20">
                    <Gavel className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {match.gameId.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2 rounded-full bg-red-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-red-500 border border-red-500/20">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Conflict Detected</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex -space-x-3">
                   <div className="h-10 w-10 rounded-full bg-neon-cyan/20 border-2 border-arcade-black flex items-center justify-center text-[10px] font-black text-neon-cyan uppercase italic">
                     {match.challengerId.username[0]}
                   </div>
                   <div className="h-10 w-10 rounded-full bg-neon-pink/20 border-2 border-arcade-black flex items-center justify-center text-[10px] font-black text-neon-pink uppercase italic">
                     {match.defenderId.username[0]}
                   </div>
                </div>
                <div className="text-right">
                   <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                     {match.challengerId.username} vs {match.defenderId.username}
                   </h3>
                   <div className="flex items-center justify-end space-x-2 mt-1">
                     <Users className="h-3 w-3 text-white/20" />
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                       {match.votes?.length || 0} Votes Cast
                     </span>
                   </div>
                </div>
              </div>

              {/* Evidence Preview */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {match.results.map((res: any, i: number) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                    <Image src={res.screenshotUrl} alt="Evidence" fill className="object-cover opacity-30 animate-fade-in" />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-neon-purple opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Enter Tribunal</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-white/5 py-32 text-center">
          <CheckCircle2 className="h-12 w-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase tracking-widest text-white/20">Clean Slate</h3>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/10">No active disputes in the sector</p>
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
