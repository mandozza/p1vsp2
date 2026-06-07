import { LoginForm } from '@/components/auth/LoginForm';
import { Joystick, User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full bg-neon-cyan/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 h-[250px] w-[250px] rounded-full bg-neon-purple/10 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl glow-cyan">
            <Joystick className="h-10 w-10 text-neon-cyan" />
          </div>
          
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow-cyan mb-4">
            Player <span className="text-neon-cyan">Login</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-white/30">
            Welcome back, Operator. Ready for the next bout?
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-arcade-black/60 p-8 backdrop-blur-2xl shadow-2xl">
          <LoginForm />
        </div>

        <div className="mt-8 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-white/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Secure JWT Sessions</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-white/10" />
          <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-white/20">
            <User className="h-3 w-3" />
            <span>Auto-provisioning Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
