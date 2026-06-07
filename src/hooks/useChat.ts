'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatEvent } from '@/lib/chat-stream';
import { getLatestMessages } from '@/actions/chat.actions';

export function useChat(machineId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchHistory = useCallback(async () => {
    const history = await getLatestMessages(machineId);
    setMessages(history);
    setLoading(false);
  }, [machineId]);

  useEffect(() => {
    fetchHistory();

    const url = machineId 
      ? `/api/chat/stream?machineId=${machineId}` 
      : '/api/chat/stream';
    
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data].slice(-100)); // Keep latest 100 in memory
      } catch (e) {
        console.error('Failed to parse chat message:', e);
      }
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, [machineId, fetchHistory]);

  return { messages, loading };
}
