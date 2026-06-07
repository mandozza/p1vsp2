'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Swords, Trophy, Zap, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { markAsRead, markAllAsRead } from '@/actions/notification.actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg bg-white/5 p-2 text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-95"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-pink text-[8px] font-black text-white glow-pink animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-arcade-black/90 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[8px] font-black uppercase tracking-widest text-neon-cyan hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <NotificationItem 
                      key={n._id} 
                      notification={n} 
                      onClick={() => {
                        handleMarkAsRead(n._id);
                        if (!n.link) return;
                        setIsOpen(false);
                      }} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell className="h-8 w-8 text-white/10 mb-2" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/20">No transmissions found</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 bg-white/5 px-4 py-2 text-center">
                <span className="text-[6px] font-black uppercase tracking-widest text-white/10">Sector 7-G Comm Link Active</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ notification, onClick }: { notification: any; onClick: () => void }) {
  const icons: any = {
    CHALLENGE_RECEIVED: Swords,
    MATCH_RESOLVED: Trophy,
    ACHIEVEMENT_UNLOCKED: Zap,
    SYSTEM: Info,
  };
  const Icon = icons[notification.type] || Info;

  const colors: any = {
    CHALLENGE_RECEIVED: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    MATCH_RESOLVED: "text-neon-pink bg-neon-pink/10 border-neon-pink/20",
    ACHIEVEMENT_UNLOCKED: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    SYSTEM: "text-white/40 bg-white/5 border-white/10",
  };

  const Content = (
    <div className={cn(
      "flex items-start space-x-3 border-b border-white/5 p-4 transition-all hover:bg-white/5",
      !notification.isRead && "bg-white/[0.02]"
    )}>
      <div className={cn("rounded-lg p-2 border shrink-0", colors[notification.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-[10px] font-black uppercase tracking-widest leading-none truncate",
            !notification.isRead ? "text-white" : "text-white/40"
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="h-1.5 w-1.5 rounded-full bg-neon-pink glow-pink" />
          )}
        </div>
        <p className="mt-1 text-[8px] font-bold text-white/30 uppercase tracking-widest line-clamp-2">
          {notification.message}
        </p>
        <span className="mt-2 block text-[6px] font-black uppercase tracking-widest text-white/10">
          {new Date(notification.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onClick}>
        {Content}
      </Link>
    );
  }

  return (
    <div className="cursor-pointer" onClick={onClick}>
      {Content}
    </div>
  );
}
