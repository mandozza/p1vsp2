'use client';

import { useState } from 'react';
import { Swords, Loader2, CheckCircle2, Coins } from 'lucide-react';
import { createChallenge } from '@/actions/match.actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function ChallengeButton({ 
  defenderId, 
  gameId,
  defenderName 
}: { 
  defenderId: string; 
  gameId: string;
  defenderName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [wager, setWager] = useState(0);
  const [showWager, setShowWager] = useState(false);

  const handleChallenge = async () => {
    setLoading(true);
    const result = await createChallenge(defenderId, gameId, wager);
    if (result.success) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setShowWager(false);
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex w-full items-center justify-center space-x-2 rounded-xl bg-green-500/20 py-3 text-xs font-black uppercase tracking-widest text-green-500 border border-green-500/30 text-center">
        <CheckCircle2 className="h-4 w-4" />
        <span>Challenge Sent!</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showWager ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center space-x-2 mb-3 px-2">
              <Coins className="h-3 w-3 text-neon-cyan" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Set Wager</span>
           </div>
           <div className="flex space-x-2">
              <input 
                type="number" 
                value={wager} 
                onChange={(e) => setWager(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-black text-white focus:outline-none focus:border-neon-cyan/50"
                placeholder="0 Credits"
              />
              <button 
                onClick={handleChallenge}
                disabled={loading}
                className="rounded-xl bg-neon-pink px-4 py-3 text-white glow-pink active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
              </button>
           </div>
           <button 
             onClick={() => setShowWager(false)}
             className="mt-2 w-full text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
           >
             Cancel
           </button>
        </div>
      ) : (
        <button
          onClick={() => setShowWager(true)}
          className="group relative flex w-full items-center justify-center space-x-2 rounded-xl bg-neon-pink py-3 text-xs font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 active:scale-95 transition-all"
        >
          <Swords className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>Challenge {defenderName}</span>
        </button>
      )}
    </div>
  );
}
