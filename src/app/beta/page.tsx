import { BetaCodeForm } from '@/components/beta/BetaCodeForm';
import { Joystick, Lock, Sparkles } from 'lucide-react';

export default function BetaPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-neon-pink/10 blur-[120px]" />
        <div className="absolute top-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-neon-cyan/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl glow-pink">
            <Lock className="h-10 w-10 text-neon-pink" />
          </div>
          
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow-pink mb-4">
            Beta <span className="text-neon-pink">Gate</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-white/30">
            Authorized Personnel Only. Insert Invite Code to proceed.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-arcade-black/60 p-8 backdrop-blur-2xl shadow-2xl">
          <BetaCodeForm />
          
          <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/20">
            <Sparkles className="h-3 w-3" />
            <span>High-Fidelity Competitive Gaming</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10">
            Sector 7-G Verification Required
          </p>
        </div>
      </div>
    </div>
  );
}
