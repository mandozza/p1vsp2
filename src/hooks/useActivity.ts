'use client';

import { useState, useEffect, useRef } from 'react';
import { ActivityEvent } from '@/lib/activity-stream';

export function useActivity() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/activity/stream');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setActivities(prev => [data, ...prev].slice(0, 10)); // Keep latest 10
      } catch (e) {
        console.error('Failed to parse activity message:', e);
      }
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, []);

  return { activities };
}
