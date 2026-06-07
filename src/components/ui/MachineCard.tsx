'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Coins, PlayCircle, Clock } from 'lucide-react';
import { IMachine } from '@/models/Machine';
import { cn } from '@/lib/utils';

interface MachineCardProps {
  machine: IMachine;
}

export function MachineCard({ machine }: MachineCardProps) {
  const isOnline = machine.status !== 'offline';
  const isInUse = machine.status === 'in-use';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 transition-all hover:border-neon-pink/50 hover:shadow-[0_0_30px_rgba(255,0,255,0.2)]"
    >
      {/* Machine Preview / Image Placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        {/* We would have a thumbnail of the stream or a prize preview here */}
        <div className="flex h-full w-full items-center justify-center bg-arcade-black">
          <PlayCircle className="h-12 w-12 text-white/10 group-hover:text-neon-pink/40 transition-colors" />
        </div>

        {/* Status Badge */}
        <div className="absolute left-3 top-3 z-20 flex items-center space-x-1.5 rounded-full bg-background/80 px-2.5 py-1 backdrop-blur-md">
          <div className={cn(
            "h-2 w-2 rounded-full",
            machine.status === 'online' ? "bg-green-500 animate-pulse" : 
            machine.status === 'in-use' ? "bg-neon-pink animate-pulse" : "bg-red-500"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            {machine.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-neon-pink transition-colors">
          {machine.name}
        </h3>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-white/50">
              <Coins className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cost</span>
            </div>
            <span className="text-sm font-black text-neon-cyan">
              {machine.costPerPlay} <span className="text-[10px]">CREDITS</span>
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 text-white/50">
              <Users className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Queue</span>
            </div>
            <span className="text-sm font-black text-white">
              {machine.queueLength} <span className="text-[10px]">WAITING</span>
            </span>
          </div>
        </div>

        <Link 
          href={`/machines/${machine._id}`} 
          className={cn(
            "mt-6 flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-all",
            isOnline 
              ? "bg-neon-pink text-white glow-pink hover:opacity-90 active:scale-95" 
              : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {machine.status === 'in-use' ? (
            <>
              <Clock className="h-4 w-4" />
              <span>Join Queue</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              <span>Play Now</span>
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
