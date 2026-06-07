'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { redeemCode } from '@/actions/beta.actions';

export function BetaCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);

    const result = await redeemCode(code);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Invalid invite code');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
          Invite Code
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Key className="h-4 w-4 text-white/20 group-focus-within:text-neon-pink transition-colors" />
          </div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="XXXXXX"
            className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm font-black uppercase tracking-[0.3em] text-white placeholder:text-white/10 focus:border-neon-pink/50 focus:bg-white/10 focus:outline-none transition-all"
            required
            autoComplete="off"
            spellCheck="false"
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
        className="group relative flex w-full items-center justify-center space-x-3 rounded-2xl bg-neon-pink py-4 text-sm font-black uppercase tracking-widest text-white glow-pink hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span>Authenticate</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
