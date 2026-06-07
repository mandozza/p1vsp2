'use client';

import { useCallback, useRef } from 'react';

const SOUNDS = {
  JACKPOT: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c3527e74c2.mp3',
  MISS: 'https://cdn.pixabay.com/audio/2022/03/15/audio_739266735e.mp3',
  TURN: 'https://cdn.pixabay.com/audio/2022/03/24/audio_34b35e236e.mp3',
  CLICK: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
} as const;

export function useAudio() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const playSound = useCallback((soundKey: keyof typeof SOUNDS) => {
    if (typeof window === 'undefined') return;

    if (!audioRefs.current[soundKey]) {
      audioRefs.current[soundKey] = new Audio(SOUNDS[soundKey]);
      audioRefs.current[soundKey].volume = 0.5;
    }

    const audio = audioRefs.current[soundKey];
    audio.currentTime = 0;
    audio.play().catch(err => console.log('Audio playback failed:', err));
  }, []);

  return { playSound };
}
