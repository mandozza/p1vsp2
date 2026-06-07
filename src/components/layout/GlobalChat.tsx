'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { sendMessage } from '@/actions/chat.actions';
import { MessageSquare, Send, X, Users, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neon-cyan text-black shadow-2xl glow-cyan hover:scale-110 active:scale-95 transition-all"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed bottom-20 right-8 z-50 flex h-[500px] w-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-arcade-black/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
               <div className="flex items-center space-x-3">
                  <Terminal className="h-4 w-4 text-neon-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Global Lobby</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
               </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.length > 0 ? (
                 messages.map((m, i) => (
                   <div key={m.id || i} className="group">
                      <div className="flex items-baseline space-x-2 mb-1">
                         <span className="text-[8px] font-black uppercase text-neon-cyan italic">
                           {m.username || m.userId?.username}
                         </span>
                         <span className="text-[6px] font-bold text-white/10 uppercase">
                           {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-[10px] font-bold text-white/70 leading-relaxed break-words">
                        {m.message}
                      </p>
                   </div>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-10">
                    <Users className="h-12 w-12 mb-4" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-center">Silence in the sector...</p>
                 </div>
               )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5">
               <div className="relative group">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Transmit message..."
                    className="w-full rounded-xl border border-white/5 bg-arcade-black py-3 pl-4 pr-12 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                  >
                    <Send className="h-3 w-3" />
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
