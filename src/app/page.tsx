import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
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
          <span>v1.0.0 is now live</span>
        </div>
        
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white md:text-7xl lg:text-8xl text-glow-pink mb-6">
          The Future of <br />
          <span className="text-neon-pink">Arcade Development</span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-white/60 md:text-xl mb-10">
          Build high-fidelity, production-ready applications with our opinionated, 
          AI-integrated boilerplate. Built for speed, security, and aesthetics.
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
            href="/docs" 
            className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <span>View Docs</span>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mt-32 px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/20 text-neon-cyan">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Blazing Fast</h3>
            <p className="text-white/50">Optimized with Next.js 16 and Tailwind CSS v4 for peak performance.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-pink/20 text-neon-pink">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Secure by Default</h3>
            <p className="text-white/50">NextAuth.js integration with strict role-based access control.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon-purple/20 text-neon-purple">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">AI-Integrated</h3>
            <p className="text-white/50">Built-in Gemini AI agent loops and real-time streaming.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
