import dbConnect from '@/lib/db';
import { Tournament } from '@/models/Tournament';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Trophy, Swords, Calendar, Users, ChevronRight, Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function TournamentsPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const tournaments = await Tournament.find({})
    .populate('gameId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Active <span className="text-neon-pink">Championships</span>
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/30">
          Enter organized tournaments to secure legendary status
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tournaments.map((t: any) => (
          <Link 
            key={t._id.toString()}
            href={`/tournaments/${t._id}`}
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-neon-pink/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-neon-pink/10 p-2 text-neon-pink border border-neon-pink/20">
                     <Trophy className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {t.gameId.title}
                  </span>
               </div>
               <StatusBadge status={t.status} />
            </div>

            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 group-hover:text-neon-pink transition-colors">
              {t.name}
            </h2>

            <div className="flex items-center space-x-8">
               <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {t.participants.length} Entrants
                  </span>
               </div>
               <div className="flex items-center space-x-2">
                  <Swords className="h-4 w-4 text-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {t.rounds.length || 1} Rounds
                  </span>
               </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
               <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
                 Authorized by Sector 7-G
               </span>
               <ChevronRight className="h-5 w-5 text-neon-pink opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    registration: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
    in_progress: "bg-neon-purple/10 text-neon-purple border-neon-purple/20 animate-pulse",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <div className={cn(
      "rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border",
      configs[status]
    )}>
      {status.replace('_', ' ')}
    </div>
  );
}
