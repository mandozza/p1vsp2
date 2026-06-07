'use client';

import { useState } from 'react';
import { registerForTournament } from '@/actions/tournament.actions';
import { useRouter } from 'next/navigation';
import { Swords, Loader2, CheckCircle2 } from 'lucide-react';

export function TournamentRegisterButton({ 
  tournamentId, 
  isRegistered 
}: { 
  tournamentId: string; 
  isRegistered: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    const result = await registerForTournament(tournamentId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (isRegistered) {
    return (
      <div className="flex items-center space-x-2 rounded-xl bg-neon-cyan/20 px-8 py-4 text-xs font-black uppercase tracking-widest text-neon-cyan border border-neon-cyan/30">
        <CheckCircle2 className="h-4 w-4" />
        <span>Registered</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={loading}
      className="group relative flex items-center space-x-3 rounded-xl bg-neon-pink px-12 py-4 text-xs font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Swords className="h-4 w-4" />
          <span>Enter Championship</span>
        </>
      )}
    </button>
  );
}
