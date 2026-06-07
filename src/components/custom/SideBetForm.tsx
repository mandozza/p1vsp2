'use client';

import { useState } from 'react';
import { placeSideBet } from '@/actions/betting.actions';
import { Coins, Loader2, Target, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SideBetForm({ matchId, challenger, defender }: { matchId: string; challenger: any; defender: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(100);
  const [votedForId, setVotedForId] = useState(challenger.id);

  const handleBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await placeSideBet({ matchId, votedForId, amount });
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
        <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Bet Placed</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Transmission received. Good luck, Operator.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-2">Place Side-Bet</h3>
        <p className="text-sm font-bold uppercase tracking-widest text-white/30">
          The arena is open. Back your champion.
        </p>
      </div>

      <form onSubmit={handleBet} className="space-y-6">
        <div className="space-y-4">
           <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Select Champion</label>
           <div className="grid grid-cols-2 gap-4">
              <PlayerSelect 
                name={challenger.username} 
                isSelected={votedForId === challenger.id} 
                onClick={() => setVotedForId(challenger.id)} 
                color="cyan" 
              />
              <PlayerSelect 
                name={defender.username} 
                isSelected={votedForId === defender.id} 
                onClick={() => setVotedForId(defender.id)} 
                color="pink" 
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Wager Amount</label>
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                 <Coins className="h-4 w-4 text-neon-cyan" />
              </div>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-black text-white focus:outline-none focus:border-neon-cyan/50"
              />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full rounded-xl bg-neon-cyan py-4 text-[10px] font-black uppercase tracking-widest text-black glow-cyan active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm Side-Bet'}
        </button>
      </form>
    </div>
  );
}

function PlayerSelect({ name, isSelected, onClick, color }: { name: string; isSelected: boolean; onClick: () => void; color: 'cyan' | 'pink' }) {
  const colors: any = {
    cyan: isSelected ? "bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10",
    pink: isSelected ? "bg-neon-pink text-white border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.3)]" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10",
  };

  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${colors[color]}`}
    >
       <span className="text-[10px] font-black uppercase tracking-widest italic">{name}</span>
    </div>
  );
}
