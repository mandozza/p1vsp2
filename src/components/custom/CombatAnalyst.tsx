'use client';

import { useState } from 'react';
import { analyzeCombatStyle } from '@/actions/profile.actions';
import { Brain, Loader2, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CombatAnalyst({ username }: { username: string }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeCombatStyle(username);
    if (result.success) {
      setReport(result.data || null);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-12">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
             <div className="rounded-lg bg-neon-cyan/10 p-2 text-neon-cyan border border-neon-cyan/20">
                <Brain className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Combat Analyst</h3>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">AI Intelligence Scouting</p>
             </div>
          </div>

          {!report && (
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center space-x-2 rounded-xl bg-neon-cyan px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-black" />}
              <span>{loading ? 'Crunching Bouts...' : 'Analyze Style'}</span>
            </button>
          )}
       </div>

       <AnimatePresence>
         {report && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="relative"
           >
              <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="h-24 w-24 text-neon-cyan" />
                 </div>
                 <p className="text-sm font-bold text-white leading-relaxed italic relative z-10">
                   "{report}"
                 </p>
              </div>
              <button 
                onClick={() => setReport(null)}
                className="mt-4 text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
              >
                Clear Intelligence
              </button>
           </motion.div>
         )}
       </AnimatePresence>

       {!report && !loading && (
         <div className="flex items-center justify-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Awaiting combat data authorization...</span>
         </div>
       )}
    </section>
  );
}
