'use client';

import { Play, ExternalLink } from 'lucide-react';

export function VideoEmbed({ url }: { url: string }) {
  const getEmbedUrl = (link: string) => {
    try {
      const urlObj = new URL(link);
      
      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Twitch
      if (urlObj.hostname.includes('twitch.tv')) {
        const clipId = urlObj.pathname.split('/').pop();
        return `https://clips.twitch.tv/embed?clip=${clipId}&parent=${window.location.hostname}`;
      }
      
      return null;
    } catch (e) {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center aspect-video w-full rounded-3xl border border-white/10 bg-white/5 group hover:bg-white/10 transition-all"
      >
        <div className="text-center">
           <Play className="h-10 w-10 text-white/20 mx-auto mb-4 group-hover:text-neon-pink group-hover:scale-110 transition-all" />
           <p className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">External Video Proof</p>
           <div className="mt-2 flex items-center justify-center space-x-2 text-[8px] text-neon-cyan">
              <span>View Clip</span>
              <ExternalLink className="h-3 w-3" />
           </div>
        </div>
      </a>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
