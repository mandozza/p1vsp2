'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Key, Coins, Activity, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  activeBetaCodes: number;
  totalCredits: number;
  systemStatus: string;
}

export function DashboardClient({ 
  initialStats, 
  config 
}: { 
  initialStats: Stats, 
  config: { pollingInterval: number; agentActive: boolean } 
}) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Polling logic
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, config.pollingInterval);

    return () => clearInterval(interval);
  }, [isLive, config.pollingInterval]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              isLive ? "bg-neon-cyan shadow-[0_0_8px_#00ffff]" : "bg-white/20"
            )} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {isLive ? 'Live Monitoring' : 'Monitoring Paused'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
            Last Update: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        <button 
          onClick={() => setIsLive(!isLive)}
          className={cn(
            "rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
            isLive 
              ? "bg-white/5 text-white/40 hover:bg-white/10" 
              : "bg-neon-cyan text-black glow-cyan"
          )}
        >
          {isLive ? 'Pause Loop' : 'Resume Loop'}
        </button>
      </div>

      {/* Stat Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Players" 
          value={stats.totalUsers} 
          icon={Users} 
          color="cyan" 
        />
        <StatCard 
          title="Active Invites" 
          value={stats.activeBetaCodes} 
          icon={Key} 
          color="pink" 
        />
        <StatCard 
          title="Economy Pool" 
          value={stats.totalCredits} 
          icon={Coins} 
          color="purple" 
          isCurrency 
        />
        <StatCard 
          title="System Health" 
          value={stats.systemStatus} 
          icon={Activity} 
          color="green" 
          isStatus
        />
      </div>

      {/* Placeholder for more complex metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-card/40 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-neon-pink" />
              <span>Agent Activity</span>
            </h3>
            <div className="rounded-full bg-neon-pink/10 border border-neon-pink/20 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-neon-pink">
              Active
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-lg bg-arcade-black flex items-center justify-center border border-white/10">
                    <ShieldCheck className="h-4 w-4 text-white/20" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white uppercase">System Audit #{1024 + i}</p>
                    <p className="text-[8px] font-bold text-white/20 uppercase">Core Protocol Verification</p>
                  </div>
                </div>
                <span className="text-[8px] font-black text-neon-cyan uppercase">Verified</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-card/40 p-8 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-neon-cyan" />
              <span>Performance</span>
            </h3>
          </div>
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Visualizer coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  isCurrency,
  isStatus
}: { 
  title: string; 
  value: any; 
  icon: any; 
  color: 'cyan' | 'pink' | 'purple' | 'green';
  isCurrency?: boolean;
  isStatus?: boolean;
}) {
  const colorMap = {
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20 glow-cyan shadow-[0_0_15px_rgba(0,255,255,0.1)]",
    pink: "text-neon-pink bg-neon-pink/10 border-neon-pink/20 glow-pink shadow-[0_0_15px_rgba(255,0,255,0.1)]",
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20 shadow-[0_0_15px_rgba(188,19,254,0.1)]",
    green: "text-green-500 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/5 bg-card/40 p-6 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("rounded-xl p-2 border", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-right"
          >
            <span className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {isCurrency && <span className="text-white/20 mr-1">$</span>}
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">
        {title}
      </h3>
    </motion.div>
  );
}
