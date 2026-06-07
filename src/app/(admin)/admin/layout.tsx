import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogOut, ExternalLink, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-arcade-black overflow-hidden">
      <AdminSidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-arcade-black/50 px-8 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View Site</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 rounded-xl bg-white/5 p-1 border border-white/5">
              <button className="rounded-lg p-2 text-white/40 hover:text-white transition-all">
                <Sun className="h-4 w-4" />
              </button>
              <button className="rounded-lg bg-neon-purple p-2 text-white shadow-[0_0_10px_rgba(188,19,254,0.3)]">
                <Moon className="h-4 w-4" />
              </button>
            </div>

            <button className="group flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              <span>Sign Out</span>
              <div className="rounded-lg bg-white/5 p-2 group-hover:bg-red-500/20 group-hover:text-red-500 transition-all">
                <LogOut className="h-3 w-3" />
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
