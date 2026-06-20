import { db } from '@/lib/db';
import { Match } from '@/models/Match';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Swords, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MatchCard } from '@/components/custom/MatchCard';
import { or, eq, desc } from 'drizzle-orm';

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const rawMatches = await db.query.matches.findMany({
    where: or(eq(Match.challengerId, session.user.id), eq(Match.defenderId, session.user.id)),
    orderBy: [desc(Match.updatedAt)],
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

  const matches = rawMatches.map((m: any) => ({
    ...m,
    _id: m.id,
    id: m.id,
    challengerId: m.challenger ? { ...m.challenger, _id: m.challengerId } : { _id: '', username: 'Unknown' },
    defenderId: m.defender ? { ...m.defender, _id: m.defenderId } : { _id: '', username: 'Unknown' },
    gameId: m.game ? { ...m.game, _id: m.gameId } : { _id: '', title: 'Unknown Game' },
  }));

  const pending = matches.filter((m: any) => m.status === 'pending');
  const active = matches.filter((m: any) => ['accepted', 'awaiting_results', 'verifying'].includes(m.status));
  const completed = matches.filter((m: any) => ['completed', 'disputed'].includes(m.status));


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Match <span className="text-neon-cyan">Center</span>
        </h1>
        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-white/30">
          Track your challenges and verify your victories
        </p>
      </div>

      <div className="space-y-12">
        {/* Pending Section */}
        {pending.length > 0 && (
          <section>
            <SectionHeader icon={Clock} title="Incoming Challenges" color="pink" />
            <div className="grid gap-4 md:grid-cols-2">
              {pending.map((match: any) => (
                <MatchCard 
                  key={match.id} 
                  match={JSON.parse(JSON.stringify(match))} 
                  currentUserId={session.user.id} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Section */}
        <section>
          <SectionHeader icon={Swords} title="Active Battles" color="cyan" />
          {active.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {active.map((match: any) => (
                <MatchCard 
                  key={match.id} 
                  match={JSON.parse(JSON.stringify(match))} 
                  currentUserId={session.user.id} 
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No active battles. Go challenge someone!" />
          )}
        </section>

        {/* History Section */}
        {completed.length > 0 && (
          <section>
            <SectionHeader icon={CheckCircle2} title="Past Glory" color="purple" />
            <div className="grid gap-4 md:grid-cols-2">
              {completed.map((match: any) => (
                <MatchCard 
                  key={match.id} 
                  match={JSON.parse(JSON.stringify(match))} 
                  currentUserId={session.user.id} 
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color }: { icon: any; title: string; color: string }) {
  const colors: any = {
    pink: "text-neon-pink bg-neon-pink/10",
    cyan: "text-neon-cyan bg-neon-cyan/10",
    purple: "text-neon-purple bg-neon-purple/10",
  };

  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className={`rounded-lg p-2 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-black uppercase tracking-tighter text-white italic">{title}</h2>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-white/5 py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-white/20">{message}</p>
    </div>
  );
}
