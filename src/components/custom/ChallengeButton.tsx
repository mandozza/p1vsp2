'use client';

import { useState } from 'react';
import { Swords, Loader2, CheckCircle2 } from 'lucide-react';
import { createChallenge } from '@/actions/match.actions';
import { useRouter } from 'next/navigation';

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

  const handleChallenge = async () => {
    setLoading(true);
    const result = await createChallenge(defenderId, gameId);
    if (result.success) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex w-full items-center justify-center space-x-2 rounded-xl bg-green-500/20 py-3 text-xs font-black uppercase tracking-widest text-green-500 border border-green-500/30">
        <CheckCircle2 className="h-4 w-4" />
        <span>Challenge Sent!</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleChallenge}
      disabled={loading}
      className="group relative flex w-full items-center justify-center space-x-2 rounded-xl bg-neon-pink py-3 text-xs font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Swords className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>Challenge {defenderName}</span>
        </>
      )}
    </button>
  );
}
