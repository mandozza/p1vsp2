'use client';

import { Brain, Zap, Shield, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function OraclePrediction({ prediction, challengerName, defenderName }: { prediction: any; challengerName: string; defenderName: string }) {
  if (!prediction) return null;

  const isChallengerPredicted = prediction.predictedWinnerId === 'challenger'; // We'll need to handle actual IDs in the real component
  const predictedName = prediction.predictedWinnerId?.username || (isChallengerPredicted ? challengerName : defenderName);

  return (
    <section className="rounded-3xl border border-neon-cyan/20 bg-neon-cyan/5 p-8 backdrop-blur-xl mb-12 relative overflow-hidden">
       {/* Background Glow */}
       <div className="absolute top-0 right-0 p-4 opacity-5">
          <Brain className="h-32 w-32 text-neon-cyan" />
       </div>

       <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
             <div className="rounded-lg bg-neon-cyan/20 p-2 text-neon-cyan border border-neon-cyan/20">
                <Brain className="h-5 w-5" />
             </div>
             <div>
                <h3 className="text-xl font-black uppercase italic text-white tracking-tighter text-glow-cyan">Oracle&apos;s Prediction</h3>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-glow-cyan">Strategic Combat Analysis</p>
             </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
             <div className="space-y-4">
                <div className="flex items-center space-x-2">
                   <Zap className="h-4 w-4 text-neon-pink" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">The Verdict</span>
                </div>
                <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
                   <span className="text-neon-pink">{predictedName}</span> is favored
                </h2>
                <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-1 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                      <TrendingUp className="h-3 w-3 text-neon-cyan" />
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Confidence: {Math.round(prediction.confidence * 100)}%</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center space-x-2">
                   <Info className="h-4 w-4 text-neon-cyan" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Analysis</span>
                </div>
                <p className="text-sm font-bold text-white leading-relaxed italic border-l-2 border-neon-cyan/30 pl-4 py-1">
                  &quot;{prediction.analysis}&quot;
                </p>
             </div>
          </div>

          {/* Odds Grid */}
          <div className="mt-10 grid grid-cols-2 gap-4">
             <OddsBox label={challengerName} odds={prediction.odds?.challenger || 2.0} color="cyan" />
             <OddsBox label={defenderName} odds={prediction.odds?.defender || 2.0} color="pink" />
          </div>
       </div>
    </section>
  );
}

function OddsBox({ label, odds, color }: { label: string; odds: number; color: 'cyan' | 'pink' }) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 flex items-center justify-between",
      color === 'cyan' ? "bg-neon-cyan/5 border-neon-cyan/10" : "bg-neon-pink/5 border-neon-pink/10"
    )}>
       <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
       <div className="text-right">
          <span className="text-2xl font-black italic text-white">x{odds.toFixed(1)}</span>
          <p className="text-[6px] font-black uppercase text-white/10 tracking-widest">Multiplier</p>
       </div>
    </div>
  );
}
