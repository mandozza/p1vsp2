import { ArrowRight, Zap, Shield, Sparkles, Trophy, Coins, MessageSquare, Gavel } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-32">
      {/* Hero Section */}
      <section className="container px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-neon-cyan backdrop-blur-sm mb-8">
          <Sparkles className="mr-2 h-4 w-4" />
          <span>v1.2.0 Elite Expansion is live</span>
        </div>
        
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white md:text-7xl lg:text-8xl text-glow-pink mb-6">
          The Ultimate <br />
          <span className="text-neon-pink text-glow-pink">Arcade Ecosystem</span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-white/60 md:text-xl mb-10">
          Build dominance, win wagers, and conquer tournaments. The single source of truth for console gaming, powered by AI verification.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link 
            href={session ? "/matches" : "/login"} 
            className="group relative flex items-center space-x-2 rounded-lg bg-neon-pink px-8 py-4 text-lg font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 transition-all active:scale-95"
          >
            <span>{session ? "Enter Match Center" : "Get Started"}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/leaderboard" 
            className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <span>Leaderboard</span>
          </Link>
        </div>
      </section>

      {/* Expansion Grid */}
      <section className="container mt-32 px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard 
            icon={Coins} 
            title="High-Stakes Economy" 
            desc="Wager credits on matches. Winner takes the pot, verified by AI."
            color="cyan"
          />
          <FeatureCard 
            icon={Trophy} 
            title="Championship Brackets" 
            desc="Join organized tournaments and climb to the Grand Finals."
            color="pink"
          />
          <FeatureCard 
            icon={MessageSquare} 
            title="Social Lobby" 
            desc="Real-time trash talk and recruitment in the global sector chat."
            color="purple"
          />
          <FeatureCard 
            icon={Gavel} 
            title="Community Tribunal" 
            desc="Vote on disputes and earn rewards for maintaining sector order."
            color="green"
          />
        </div>
      </section>

      {/* Tech Grid */}
      <section className="container mt-32 px-4 border-t border-white/5 pt-32">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/20 text-neon-cyan">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">AI-Oracle Verification</h3>
            <p className="text-white/50">Gemini 1.5 Vision extracts scores directly from your screenshots with 99% accuracy.</p>
          </div>

          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-pink/20 text-neon-pink">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Sector Integration</h3>
            <p className="text-white/50">Full Discord integration broadcasts major wins and tournament starts to your community.</p>
          </div>

          <div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/20 text-neon-purple">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Mobile-First Polish</h3>
            <p className="text-white/50">Fast, client-side image compression for reliable uploads from your phone.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  const colors: any = {
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    pink: "text-neon-pink bg-neon-pink/10 border-neon-pink/20",
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm group hover:border-white/20 transition-all">
      <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-widest text-white mb-3 italic">{title}</h3>
      <p className="text-xs font-bold text-white/30 uppercase leading-relaxed tracking-widest">{desc}</p>
    </div>
  );
}
