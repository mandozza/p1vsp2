'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Check, X, Camera, Loader2, ChevronRight, Coins } from 'lucide-react';
import { acceptChallenge } from '@/actions/match.actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MatchCard({ 
  match, 
  currentUserId 
}: { 
  match: any; 
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isDefender = match.defenderId._id === currentUserId;
  const isPending = match.status === 'pending';
  const opponent = isDefender ? match.challengerId : match.defenderId;

  const handleAccept = async () => {
    setLoading(true);
    const result = await acceptChallenge(match._id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-neon-cyan/10 p-1.5 text-neon-cyan border border-neon-cyan/20">
            <Swords className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {match.gameId.title}
          </span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            vs <span className="text-neon-pink">{opponent.username}</span>
          </h3>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
              {isPending ? (isDefender ? 'They challenged you' : 'Waiting for them...') : 'Battle in progress'}
            </p>
            {match.wagerAmount > 0 && (
              <div className="flex items-center space-x-1 rounded-full bg-neon-cyan/10 px-2 py-0.5 border border-neon-cyan/20">
                 <Coins className="h-2 w-2 text-neon-cyan" />
                 <span className="text-[8px] font-black text-neon-cyan uppercase">Pot: {match.wagerAmount * 2}</span>
              </div>
            )}
          </div>
        </div>

        {isPending && isDefender ? (
          <div className="flex space-x-2">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="rounded-lg bg-neon-cyan p-2 text-black hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button className="rounded-lg bg-white/5 p-2 text-white/40 hover:bg-white/10 active:scale-95 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href={`/matches/${match._id}`}
            className="rounded-lg bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
      </div>

      {match.status === 'accepted' && (
        <Link
          href={`/matches/${match._id}`}
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl border border-neon-pink/30 bg-neon-pink/10 py-2.5 text-[10px] font-black uppercase tracking-widest text-neon-pink hover:bg-neon-pink/20 transition-all"
        >
          <Camera className="h-3 w-3" />
          <span>Upload Results</span>
        </Link>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    accepted: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
    awaiting_results: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    verifying: "bg-neon-purple/10 text-neon-purple border-neon-purple/20 animate-pulse",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    disputed: "bg-red-500/10 text-red-500 border-red-500/20",
    cancelled: "bg-white/5 text-white/20 border-white/10",
  };

  return (
    <div className={cn(
      "rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest border",
      configs[status] || configs.pending
    )}>
      {status.replace('_', ' ')}
    </div>
  );
}
