'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Joystick, Coins, User, Plus } from 'lucide-react';
import { CreditModal } from '@/components/custom/CreditModal';

export function Navbar() {
  const { data: session } = useSession();
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const userId = session?.user?.id;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="rounded-lg bg-neon-pink p-1.5 glow-pink group-hover:scale-110 transition-transform">
              <Joystick className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic text-glow-pink">
              ProProject
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsCreditModalOpen(true)}
                className="group flex items-center space-x-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 shadow-[0_0_10px_rgba(0,255,255,0.1)] transition-all hover:bg-neon-cyan/20 active:scale-95"
              >
                <Coins className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm font-bold text-neon-cyan">
                  {((session?.user as any)?.creditBalance || 0).toLocaleString()}
                </span>
                <div className="rounded-full bg-neon-cyan/20 p-0.5 text-neon-cyan group-hover:bg-neon-cyan group-hover:text-black transition-colors">
                  <Plus className="h-3 w-3" />
                </div>
              </button>
            </div>

            {session ? (
              <Link href="/profile" className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center border border-white/20">
                  <User className="h-4 w-4" />
                </div>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="rounded-lg bg-neon-pink px-4 py-2 text-sm font-bold text-white uppercase tracking-wider glow-pink hover:opacity-90 transition-all active:scale-95"
              >
                Insert Coin
              </Link>
            )}
          </div>
        </div>
      </nav>

      <CreditModal 
        userId={userId}
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </>
  );
}
