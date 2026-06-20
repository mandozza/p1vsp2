'use client';

import { useState } from 'react';
import { initiateVerification, verifyOperatorTag, getProfileUploadUrl } from '@/actions/profile.actions';
import { ShieldCheck, Loader2, Upload, Key, Camera, Info, Monitor, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function VerificationSector({ user }: { user: any }) {
  const [status, setStatus] = useState(user.verificationStatus);
  const [tag, setTag] = useState(user.gamerTag || '');
  const [platform, setPlatform] = useState(user.tagPlatform || 'PSN');
  const [code, setCode] = useState(user.verificationCode || '');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleInitiate = async () => {
    if (!tag) return;
    setLoading(true);
    const result = await initiateVerification(tag, platform);
    if (result.success) {
      setCode(result.code);
      setStatus('pending');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // 1. Get upload URL
      const urlResult = await getProfileUploadUrl('verification', file.type);
      if (!urlResult.success || !urlResult.data) throw new Error(urlResult.error || 'Failed to get upload URL');

      // 2. Upload to S3
      await fetch(urlResult.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // 3. AI Verification
      const verifyResult = await verifyOperatorTag(urlResult.data.publicUrl);
      if (verifyResult.success) {
        setStatus('verified');
      } else {
        alert(verifyResult.error);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'verified') {
    return (
      <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-8 text-center backdrop-blur-xl">
         <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 border border-green-500/30 glow-green shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <ShieldCheck className="h-8 w-8" />
         </div>
         <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Verified Operator</h3>
         <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Your identity is secured. Full sector access granted.</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-12 overflow-hidden relative">
       <div className="flex items-center space-x-3 mb-8">
          <div className="rounded-lg bg-neon-cyan/10 p-2 text-neon-cyan border border-neon-cyan/20">
             <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
             <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Operator Verification</h3>
             <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Establish Identity Chain-of-Command</p>
          </div>
       </div>

       {status === 'unverified' ? (
         <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Gamer Tag</label>
                  <input 
                    value={tag} 
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Enter your console ID..."
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Platform</label>
                  <select 
                    value={platform} 
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none"
                  >
                     <option value="PSN">PlayStation Network</option>
                     <option value="XBOX">Xbox Live</option>
                     <option value="STEAM">Steam</option>
                  </select>
               </div>
            </div>
            <button 
              onClick={handleInitiate}
              disabled={!tag || loading}
              className="w-full rounded-xl bg-neon-cyan py-4 text-[10px] font-black uppercase tracking-widest text-black glow-cyan active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Generate Verification Code'}
            </button>
         </div>
       ) : (
         <div className="space-y-8">
            <div className="rounded-2xl border border-neon-pink/20 bg-neon-pink/5 p-6">
               <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-xl bg-neon-pink text-white flex items-center justify-center shrink-0">
                     <Key className="h-5 w-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-neon-pink mb-1">Active Protocol Code</p>
                     <h2 className="text-3xl font-black italic text-white tracking-[0.2em]">{code}</h2>
                  </div>
               </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center space-x-2">
                     <Info className="h-3 w-3" />
                     <span>Instructions</span>
                  </h4>
                  <ul className="space-y-3 text-[9px] font-bold text-white/40 uppercase leading-relaxed list-decimal list-inside">
                     <li>Add the code <span className="text-white">{code}</span> to your public console Bio.</li>
                     <li>Navigate to your profile screen showing your Tag and Bio.</li>
                     <li>Take a screenshot and upload it below.</li>
                     <li>AI Oracle will verify ownership automatically.</li>
                  </ul>
               </div>

               <div className="space-y-4">
                  <div 
                    onClick={() => !loading && document.getElementById('verify-upload')?.click()}
                    className={cn(
                      "aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
                      preview ? "border-white/20" : "border-white/10 hover:border-neon-cyan/50 bg-white/5"
                    )}
                  >
                     {preview ? (
                        <Image src={preview} alt="Proof" width={400} height={225} className="object-cover w-full h-full opacity-50" />
                     ) : (
                        <>
                           <Camera className="h-10 w-10 text-white/10 mb-2" />
                           <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Click to Upload Proof</p>
                        </>
                     )}
                  </div>
                  <input id="verify-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  
                  <button 
                    onClick={handleVerify}
                    disabled={!file || loading}
                    className="w-full rounded-xl bg-neon-pink py-4 text-[10px] font-black uppercase tracking-widest text-white glow-pink active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Finalize Verification'}
                  </button>
               </div>
            </div>
         </div>
       )}
    </section>
  );
}
