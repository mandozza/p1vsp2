'use client';

import { motion } from 'framer-motion';
import { MachineCard } from './MachineCard';
import { IMachine } from '@/models/Machine';

interface MachineGridProps {
  machines: IMachine[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function MachineGrid({ machines }: MachineGridProps) {
  if (machines.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
        <h3 className="text-xl font-black uppercase tracking-widest text-white/20">
          No Machines Online
        </h3>
        <p className="mt-2 text-sm text-white/10">
          Check back soon for more claw action.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {machines.map((machine) => (
        <motion.div key={machine._id} variants={item}>
          <MachineCard machine={machine} />
        </motion.div>
      ))}
    </motion.div>
  );
}
