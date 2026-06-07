'use client';

export function CreditModal({ 
  isOpen, 
  onClose,
  userId 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  userId?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-depth-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-neon-pink text-glow-pink mb-4">
          Add Credits
        </h2>
        <p className="text-white/70 mb-6">
          Credit system implementation coming soon.
        </p>
        <button 
          onClick={onClose}
          className="w-full rounded-lg bg-neon-cyan py-3 font-bold text-black uppercase tracking-widest hover:opacity-90 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
