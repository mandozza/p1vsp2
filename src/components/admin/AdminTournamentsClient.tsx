'use client';

import { useState } from 'react';
import { createTournament, startTournament } from '@/actions/tournament.actions';
import { Plus, Trophy, Users, Play, Calendar, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminTournamentsClient({ initialTournaments, games }: { initialTournaments: any[]; games: any[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      gameId: formData.get('gameId') as string,
    };

    const result = await createTournament(data);
    if (result.success) {
      window.location.reload();
    }
    setLoading(false);
  };

  const handleStart = async (id: string) => {
    if (!confirm('Generate brackets and start the tournament?')) return;
    setLoading(true);
    const result = await startTournament(id);
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Tournament <span className="text-neon-pink">Command</span>
        </h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 rounded-xl bg-neon-pink px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Championship</span>
        </button>
      </div>

      <div className="grid gap-6">
        {initialTournaments.map((t) => (
          <div key={t._id} className="relative overflow-hidden rounded-3xl border border-white/5 bg-card/40 p-8 backdrop-blur-xl">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                   <div className="rounded-2xl bg-neon-pink/10 p-4 text-neon-pink border border-neon-pink/20">
                      <Trophy className="h-8 w-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">{t.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                         <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{t.gameId.title}</span>
                         <div className="h-1 w-1 rounded-full bg-white/10" />
                         <span className={cn(
                           "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                           t.status === 'registration' ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20" :
                           t.status === 'in_progress' ? "bg-neon-purple/10 text-neon-purple border-neon-purple/20" :
                           "bg-green-500/10 text-green-500 border-green-500/20"
                         )}>
                           {t.status}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center space-x-8">
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Participants</p>
                      <p className="text-xl font-black text-white italic">{t.participants.length}</p>
                   </div>
                   
                   {t.status === 'registration' && (
                     <button 
                       onClick={() => handleStart(t._id)}
                       disabled={loading || t.participants.length < 2}
                       className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 transition-all disabled:opacity-30"
                     >
                       <Play className="h-4 w-4 fill-black" />
                       <span>Start Bracket</span>
                     </button>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-arcade-black p-8 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8">
              Initiate <span className="text-neon-pink">Tournament</span>
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Tournament Name</label>
                <input name="name" className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-pink/50" placeholder="e.g. UFC 6 World Series" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Game Protocol</label>
                  <select name="gameId" className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none appearance-none">
                     {games.map(g => (
                       <option key={g._id} value={g._id}>{g.title}</option>
                     ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Entry Fee</label>
                  <input name="entryFee" type="number" className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-pink/50" placeholder="0" />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-neon-pink py-4 text-[10px] font-black uppercase tracking-widest text-white glow-pink">
                  {loading ? "Transmitting..." : "Open Registration"}
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 rounded-xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
