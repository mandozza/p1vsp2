'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Loader2, Coins, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError('System Failure: Could not authenticate');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
          Player Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Mail className="h-4 w-4 text-white/20 group-focus-within:text-neon-cyan transition-colors" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="player@pro-project.io"
            className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-black text-white placeholder:text-white/10 focus:border-neon-cyan/50 focus:bg-white/10 focus:outline-none transition-all"
            required
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[10px] font-bold uppercase tracking-widest text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group relative flex w-full items-center justify-center space-x-3 rounded-2xl bg-neon-cyan py-4 text-sm font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Coins className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>Insert Coin</span>
          </>
        )}
      </button>

      <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] text-white/20">
        Account created automatically on first entry
      </p>
    </form>
  );
}
