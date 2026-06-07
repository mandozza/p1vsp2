'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, Video } from 'lucide-react';
import { getResultUploadUrl, submitMatchResult } from '@/actions/match.actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function ResultUploader({ matchId }: { matchId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLoading(true);
      try {
        // Compress image before setting it
        const compressedFile = await compressImage(selectedFile);
        setFile(compressedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Compression failed:', error);
        setFile(selectedFile); // Fallback to original
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Simple client-side compression using Canvas
   */
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 720;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          }, 'image/jpeg', 0.8);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get presigned URL
      const urlResult = await getResultUploadUrl(matchId, file.type);
      if (!urlResult.success) throw new Error(urlResult.error);

      const { uploadUrl, publicUrl } = urlResult.data;

      // 2. Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload to S3');

      // 3. Submit result to DB
      const submitResult = await submitMatchResult(matchId, publicUrl, videoUrl);
      if (!submitResult.success) throw new Error(submitResult.error);

      setSuccess(true);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Submission Received</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 group">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { setFile(null); setPreview(null); }}
              className="rounded-lg bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !loading && fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center aspect-video w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all",
            loading ? "border-neon-cyan bg-neon-cyan/5" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-neon-pink/30"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-12 w-12 text-neon-cyan animate-spin mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-neon-cyan">Analyzing File...</p>
            </>
          ) : (
            <>
              <Camera className="h-12 w-12 text-white/20 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-white/40">Click to upload screenshot</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/10 mt-2">JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center space-x-2">
          <Video className="h-3 w-3" />
          <span>Video Proof Link (Optional)</span>
        </label>
        <input 
          type="url" 
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube or Twitch Clip URL..."
          className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-[10px] font-bold text-white focus:outline-none focus:border-neon-pink/50 transition-all"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="flex w-full items-center justify-center space-x-2 rounded-xl bg-neon-cyan py-4 text-sm font-black uppercase tracking-widest text-black glow-cyan hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Securing Proof...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5" />
            <span>Verify Win</span>
          </>
        )}
      </button>
    </div>
  );
}
