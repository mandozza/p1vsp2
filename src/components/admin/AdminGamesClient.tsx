'use client';

import { useState } from 'react';
import { saveGame, toggleGameActive } from '@/actions/admin-game.actions';
import { Plus, Edit2, Power, Brain, LayoutGrid, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminGamesClient({ initialGames }: { initialGames: any[] }) {
  const [games, setGames] = useState(initialGames);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      _id: isEditing?._id,
      title: formData.get('title'),
      slug: formData.get('slug'),
      gameType: formData.get('gameType'),
      aiPrompt: formData.get('aiPrompt'),
      thumbnailUrl: formData.get('thumbnailUrl'),
    };

    const result = await saveGame(data);
    if (result.success) {
      window.location.reload(); // Simple refresh for now
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Game <span className="text-neon-cyan">Protocols</span>
        </h1>
        <button 
          onClick={() => setIsEditing({ title: '', slug: '', gameType: 'FIGHTING', aiPrompt: '', thumbnailUrl: '' })}
          className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Sector</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div key={game._id} className="relative overflow-hidden rounded-3xl border border-white/5 bg-card/40 p-6 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                   <div className="rounded-lg bg-white/5 p-2 border border-white/10">
                      <LayoutGrid className="h-4 w-4 text-white/40" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase text-white">{game.title}</h3>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{game.gameType}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-2">
                   <button 
                     onClick={() => setIsEditing(game)}
                     className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-white transition-all"
                   >
                     <Edit2 className="h-3 w-3" />
                   </button>
                   <button 
                     onClick={() => toggleGameActive(game._id)}
                     className={cn(
                       "rounded-lg p-2 transition-all",
                       game.active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                     )}
                   >
                     <Power className="h-3 w-3" />
                   </button>
                </div>
             </div>

             <div className="space-y-4">
                <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                   <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-3 w-3 text-neon-pink" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">AI Protocol</span>
                   </div>
                   <p className="text-[10px] text-white/60 line-clamp-3 leading-relaxed italic">
                      {game.aiPrompt || "No custom prompt defined. Using system default."}
                   </p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-arcade-black p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8">
                {isEditing._id ? 'Edit' : 'Create'} Game <span className="text-neon-cyan">Config</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Title</label>
                    <input name="title" defaultValue={isEditing.title} className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Slug</label>
                    <input name="slug" defaultValue={isEditing.slug} className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50" required />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Genre</label>
                    <select name="gameType" defaultValue={isEditing.gameType} className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50 appearance-none">
                       <option value="FIGHTING">Fighting</option>
                       <option value="SPORTS">Sports</option>
                       <option value="RACING">Racing</option>
                       <option value="SHOOTER">Shooter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Thumbnail URL</label>
                    <input name="thumbnailUrl" defaultValue={isEditing.thumbnailUrl} className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center space-x-2">
                    <Brain className="h-3 w-3 text-neon-pink" />
                    <span>AI Extraction Prompt</span>
                  </label>
                  <textarea 
                    name="aiPrompt" 
                    defaultValue={isEditing.aiPrompt} 
                    rows={6}
                    placeholder="Tell Gemini how to identify the winner, score, and DNF state for this game's screenshots..."
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-pink/50 leading-relaxed"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-neon-cyan py-4 text-[10px] font-black uppercase tracking-widest text-black glow-cyan">
                    {loading ? "Transmitting..." : "Save Protocol"}
                  </button>
                  <button type="button" onClick={() => setIsEditing(null)} className="flex-1 rounded-xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
