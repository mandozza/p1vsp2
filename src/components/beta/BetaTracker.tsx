'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/actions/beta.actions';
import { nanoid } from 'nanoid';

export function BetaTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Initialize or retrieve session ID
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('pro-project_session_id');
      if (!id) {
        id = nanoid();
        sessionStorage.setItem('pro-project_session_id', id);
      }
      sessionIdRef.current = id;
    }
  }, []);

  useEffect(() => {
    if (sessionIdRef.current && pathname) {
      trackPageView(pathname, sessionIdRef.current);
    }
  }, [pathname]);

  return null; // Invisible component
}
