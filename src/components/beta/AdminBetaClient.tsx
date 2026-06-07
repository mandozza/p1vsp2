'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Users, Activity, Plus, Search, ChevronRight, Clock, Globe } from 'lucide-react';
import { generateCodes } from '@/actions/beta.actions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AdminBetaClientProps {
  codes: any[];
  journeys: any[];
}

export function AdminBetaClient({ codes, journeys }: AdminBetaClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'codes' | 'journeys'>('codes');

  const handleGenerate = async () => {
    setLoading(true);
    await generateCodes(5, 'Manual Drop');
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
            Beta Command
          </h1>
          <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/30">
            Access control & user journey analytics
          </p>
        </div>

        <div className="flex space-x-4">
          <div className="flex bg-arcade-black border border-white/5 rounded-2xl p-1">
            <button
              onClick={() => setView('codes')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'codes' ? "bg-neon-pink text-white glow-pink" : "text-white/30 hover:text-white"
              )}
            >
              Invite Codes
            </button>
            <button
              onClick={() => setView('journeys')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'journeys' ? "bg-neon-pink text-white glow-pink" : "text-white/30 hover:text-white"
              )}
            >
              Live Journeys
            </button>
          </div>
          {view === 'codes' && (
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-2 rounded-2xl bg-neon-cyan px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Generate 5</span>
            </button>
          )}
        </div>
      </div>

      {view === 'codes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {codes.map((c) => (
            <div key={c._id} className="rounded-2xl border border-white/5 bg-card/40 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black tracking-[0.2em] text-white">{c.code}</span>
                <div className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest",
                  c.usedAt ? "bg-white/10 text-white/30" : "bg-neon-pink/20 text-neon-pink border border-neon-pink/20 glow-pink"
                )}>
                  {c.usedAt ? 'Used' : 'Active'}
                </div>
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">{c.note || 'No note'}</p>
              {c.usedAt && (
                <div className="flex items-center space-x-2 text-[8px] font-black text-white/40 uppercase">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(c.usedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {journeys.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-white/5 py-20 text-center">
              <Activity className="h-12 w-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase tracking-widest text-white/20">No active journeys</h3>
            </div>
          ) : (
            journeys.map((j) => (
              <div key={j._id} className="rounded-3xl border border-white/5 bg-card/30 overflow-hidden">
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-neon-cyan/20 p-1.5">
                      <Globe className="h-4 w-4 text-neon-cyan" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Session: {j._id.slice(-8)}</span>
                  </div>
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                    Last Seen: {new Date(j.latest).toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {j.views.map((v: any, i: number) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="rounded-xl border border-white/5 bg-arcade-black px-4 py-2 flex flex-col">
                          <span className="text-[10px] font-black uppercase text-white/80">{v.path}</span>
                          <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                            {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        {i < j.views.length - 1 && <ChevronRight className="h-3 w-3 text-white/10" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
