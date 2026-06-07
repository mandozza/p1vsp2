'use client';

import { useState, useRef } from 'react';
import { updateProfile, getProfileUploadUrl } from '@/actions/profile.actions';
import { User, Camera, Image as ImageIcon, Loader2, CheckCircle2, Globe, Disc as Discord, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function SettingsClient({ initialUser }: { initialUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: initialUser.bio || '',
    psn: initialUser.linkedAccounts?.psn || '',
    xbox: initialUser.linkedAccounts?.xbox || '',
    discord: initialUser.linkedAccounts?.discord || '',
    avatarUrl: initialUser.avatarUrl || '',
    bannerUrl: initialUser.bannerUrl || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(initialUser.avatarUrl || '');
  const [bannerPreview, setBannerPreview] = useState(initialUser.bannerUrl || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Get upload URL
      const urlResult = await getProfileUploadUrl(type, file.type);
      if (!urlResult.success) throw new Error(urlResult.error);

      // 2. Upload to S3
      await fetch(urlResult.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // 3. Update preview and form data
      if (type === 'avatar') {
        setAvatarPreview(urlResult.data.publicUrl);
        setFormData(prev => ({ ...prev, avatarUrl: urlResult.data.publicUrl }));
      } else {
        setBannerPreview(urlResult.data.publicUrl);
        setFormData(prev => ({ ...prev, bannerUrl: urlResult.data.publicUrl }));
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
          Operator <span className="text-neon-cyan">Settings</span>
        </h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-white/30">
          Personalize your sector identity
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 pb-20">
        {/* Visuals Section */}
        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Identity Assets</span>
           </h3>

           <div className="grid gap-8 md:grid-cols-2">
              {/* Avatar Upload */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1 text-center block">Avatar Protocol</label>
                 <div className="flex flex-col items-center">
                    <div className="relative group">
                       <div className="h-32 w-32 rounded-3xl bg-neon-cyan p-1 glow-cyan overflow-hidden">
                          <div className="h-full w-full rounded-2xl bg-arcade-black flex items-center justify-center relative overflow-hidden">
                             {avatarPreview ? (
                               <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
                             ) : (
                               <User className="h-12 w-12 text-white/20" />
                             )}
                          </div>
                       </div>
                       <button 
                         type="button"
                         onClick={() => document.getElementById('avatar-input')?.click()}
                         className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"
                       >
                          <Camera className="h-6 w-6 text-white" />
                       </button>
                    </div>
                    <input id="avatar-input" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                 </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1 text-center block">Banner Protocol</label>
                 <div className="relative group h-32 w-full rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
                    {bannerPreview ? (
                      <Image src={bannerPreview} alt="Banner" fill className="object-cover opacity-50" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                         <ImageIcon className="h-8 w-8 text-white/10" />
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => document.getElementById('banner-input')?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <Camera className="h-6 w-6 text-white" />
                    </button>
                 </div>
                 <input id="banner-input" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
              </div>
           </div>
        </section>

        {/* Info Section */}
        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Bio-Data</span>
           </h3>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Transmission Message (Bio)</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                maxLength={160}
                placeholder="Broadcast your intent to the sector..."
                className="w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50 leading-relaxed"
              />
              <div className="text-right">
                 <span className="text-[8px] font-black text-white/10">{formData.bio.length}/160</span>
              </div>
           </div>
        </section>

        {/* Social Links */}
        <section className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center space-x-2">
              <Discord className="h-4 w-4" />
              <span>Linked Accounts</span>
           </h3>

           <div className="grid gap-6 md:grid-cols-3">
              <SocialInput 
                icon={<div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black text-white italic">P</div>} 
                label="PSN ID" 
                value={formData.psn}
                onChange={(v) => setFormData(prev => ({ ...prev, psn: v }))}
              />
              <SocialInput 
                icon={<div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-[8px] font-black text-white italic">X</div>} 
                label="Xbox Gamertag" 
                value={formData.xbox}
                onChange={(v) => setFormData(prev => ({ ...prev, xbox: v }))}
              />
              <SocialInput 
                icon={<Discord className="h-4 w-4 text-[#5865F2]" />} 
                label="Discord Handle" 
                value={formData.discord}
                onChange={(v) => setFormData(prev => ({ ...prev, discord: v }))}
              />
           </div>
        </section>

        {/* Actions */}
        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
           <div>
              {success && (
                <div className="flex items-center space-x-2 text-green-500 animate-in fade-in zoom-in duration-300">
                   <CheckCircle2 className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Protocol Updated</span>
                </div>
              )}
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="flex items-center space-x-3 rounded-2xl bg-neon-cyan px-10 py-4 text-[10px] font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
           >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Commit Changes</span>
           </button>
        </div>
      </form>
    </div>
  );
}

function SocialInput({ icon, label, value, onChange }: { icon: any; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
       <label className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-1 flex items-center space-x-2">
          {icon}
          <span>{label}</span>
       </label>
       <input 
         value={value}
         onChange={(e) => onChange(e.target.value)}
         className="w-full rounded-xl border border-white/5 bg-white/5 p-3 text-[10px] font-bold text-white focus:outline-none focus:border-neon-cyan/50"
       />
    </div>
  );
}
