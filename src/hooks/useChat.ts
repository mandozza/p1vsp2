'use client';

import { useState, useEffect, useRef } from 'react';

export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch('/api/chat/history')
      .then(res => res.json())
      .then(data => setMessages(data.reverse()));

    const es = new EventSource('/api/chat/stream');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return;

        setMessages(prev => [...prev, data].slice(-100)); // Keep latest 100
      } catch (e) {
        console.error('Failed to parse chat message:', e);
      }
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, []);

  return { messages };
}
