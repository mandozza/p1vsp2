'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, Joystick, Truck, TrendingUp, ChevronRight, FlaskConical, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { name: 'Intelligence', href: '/admin', icon: TrendingUp },
  { name: 'Beta Command', href: '/admin/beta', icon: FlaskConical },
  { name: 'Game Protocols', href: '/admin/games', icon: LayoutGrid },
  { name: 'Tournament Command', href: '/admin/tournaments', icon: Trophy },
  { name: 'Fulfillment', href: '/admin/orders', icon: Truck },
  { name: 'Machines', href: '/admin/machines', icon: Joystick },
  { name: 'Players', href: '/admin/users', icon: Users },
  { name: 'Prizes', href: '/admin/prizes', icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-arcade-black/50 backdrop-blur-xl">
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center space-x-2">
          <div className="rounded-lg bg-neon-pink p-1 glow-pink">
            <Joystick className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black uppercase italic text-white tracking-tighter">
            AdminPortal
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all",
                isActive 
                  ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/20" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn("h-4 w-4", isActive ? "text-neon-pink" : "text-white/20 group-hover:text-white/40")} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="rounded-2xl bg-white/5 p-4 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">
          Admin Portal v1.0
        </div>
      </div>
    </div>
  );
}
