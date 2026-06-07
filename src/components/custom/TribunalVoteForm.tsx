'use client';

import { useState } from 'react';
import { castTribunalVote } from '@/actions/tribunal.actions';
import { useRouter } from 'next/navigation';
import { Gavel, Loader2, CheckCircle2 } from 'lucide-react';

export function TribunalVoteForm({ 
  matchId, 
  challengerId, 
  defenderId,
  challengerName,
  defenderName
}: { 
  matchId: string; 
  challengerId: string;
  defenderId: string;
  challengerName: string;
  defenderName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVote = async (votedForId: string) => {
    setLoading(true);
    const result = await castTribunalVote(matchId, votedForId);
    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8 text-center backdrop-blur-xl">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Vote Submitted</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Thank you for helping maintain the sector integrity.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">Cast Your Verdict</h3>
        <p className="text-sm font-bold uppercase tracking-widest text-white/30">
          Based on the evidence above, who won this match?
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VoteButton 
          name={challengerName} 
          onClick={() => handleVote(challengerId)} 
          disabled={loading} 
          color="cyan" 
        />
        <VoteButton 
          name={defenderName} 
          onClick={() => handleVote(defenderId)} 
          disabled={loading} 
          color="pink" 
        />
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-neon-purple animate-pulse">
           <Loader2 className="h-4 w-4 animate-spin" />
           <span>Recording Verdict...</span>
        </div>
      )}
    </div>
  );
}

function VoteButton({ name, onClick, disabled, color }: { name: string, onClick: () => void, disabled: boolean, color: 'cyan' | 'pink' }) {
  const colors: any = {
    cyan: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan hover:text-black shadow-[0_0_15px_rgba(0,255,255,0.1)]",
    pink: "bg-neon-pink/10 border-neon-pink/30 text-neon-pink hover:bg-neon-pink hover:text-black shadow-[0_0_15px_rgba(255,0,255,0.1)]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex items-center justify-between rounded-2xl border px-8 py-4 transition-all active:scale-95 disabled:opacity-50 ${colors[color]}`}
    >
      <span className="text-sm font-black uppercase tracking-widest italic">{name}</span>
      <Gavel className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
