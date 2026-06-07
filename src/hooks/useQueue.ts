'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getQueueForMachine } from '@/actions/queue.actions';

interface QueueUser {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  status: 'waiting' | 'playing';
  joinedAt: string;
}

export function useQueue(machineId: string, currentUserId: string | undefined) {
  const [queue, setQueue] = useState<QueueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQueue = useCallback(async () => {
    const sessions = await getQueueForMachine(machineId);
    setQueue(sessions);
    setLoading(false);
  }, [machineId]);

  useEffect(() => {
    fetchQueue();

    // 1. Try to connect via SSE
    try {
      const es = new EventSource(`/api/queue/${machineId}/stream`);
      
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'REFRESH') {
            fetchQueue();
          }
        } catch (e) {
          console.error('Failed to parse SSE message:', e);
        }
      };

      es.onerror = () => {
        console.warn('SSE connection lost. Falling back to polling.');
        es.close();
        // Trigger fallback polling if not already running
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchQueue, 5000);
        }
      };

      eventSourceRef.current = es;
    } catch (error) {
      console.warn('SSE not supported. Falling back to polling.');
      pollingIntervalRef.current = setInterval(fetchQueue, 5000);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchQueue, machineId]);

  const currentPlayer = queue.find(s => s.status === 'playing');
  const isMyTurn = currentPlayer?.userId?._id === currentUserId;
  const myPosition = queue.filter(s => s.status === 'waiting')
    .findIndex(s => s.userId?._id === currentUserId) + 1;
  const isInQueue = queue.some(s => s.userId?._id === currentUserId);

  return {
    queue,
    loading,
    currentPlayer,
    isMyTurn,
    myPosition,
    isInQueue,
    refreshQueue: fetchQueue
  };
}
