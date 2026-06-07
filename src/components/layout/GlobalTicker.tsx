'use client';

import { useActivity } from '@/hooks/useActivity';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trophy, Swords, Zap, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalTicker() {
  const { activities } = useActivity();
  const latest = activities[0];

  return (
    <div className="fixed bottom-0 z-40 w-full border-t border-white/5 bg-arcade-black/80 py-2 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center space-x-2">
            <Radio className="h-3 w-3 text-neon-pink animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Sector Live Feed</span>
          </div>
          
          <div className="h-4 w-px bg-white/10 mx-2" />

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {latest ? (
                <motion.div
                  key={latest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3"
                >
                  <IconByType type={latest.type} />
                  <span className="text-[10px] font-black uppercase italic tracking-widest text-white truncate">
                    {latest.message}
                  </span>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest whitespace-nowrap">
                    {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </motion.div>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-white/10 italic">
                  Awaiting sector activity...
                </span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4 ml-6">
           <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Core Protocol Normal</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function IconByType({ type }: { type: string }) {
  switch (type) {
    case 'CHALLENGE':
      return <Swords className="h-3 w-3 text-neon-cyan" />;
    case 'VICTORY':
      return <Trophy className="h-3 w-3 text-neon-pink" />;
    case 'ACHIEVEMENT':
      return <Zap className="h-3 w-3 text-yellow-500" />;
    default:
      return <Activity className="h-3 w-3 text-white/40" />;
  }
}
