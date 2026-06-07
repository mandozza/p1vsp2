'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname === '/beta' || pathname === '/login') return null;

  return (
    <footer className="w-full border-t border-white/10 bg-background/50 py-8 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold tracking-tighter text-white/50 uppercase italic">
              ProProject &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex space-x-6 text-xs font-bold uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-neon-pink transition-colors">Terms</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-neon-purple transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
