'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseHardwareOptions {
  userId: string;
  machineId: string;
  onResult?: (result: { success: boolean; message: string; prizeId: string | null }) => void;
}

export function useHardware({ userId, machineId, onResult }: UseHardwareOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number>(0);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    // In a real app, this would be a secure gateway URL
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0; // Reset attempts on success
      console.log('Connected to Hardware Simulator');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'RESULT' && onResult) {
          onResult(data);
        }
      } catch (e) {
        console.error('Failed to parse message from hardware:', e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from Hardware Simulator');
      
      // Exponential backoff reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, delay);
    };

    ws.current = socket;
  }, [onResult]);

  useEffect(() => {
    connect();

    // Simulate latency tracking
    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        setLatency(Math.floor(Math.random() * 20) + 80); // 80-100ms
      } else {
        setLatency(0);
      }
    }, 2000);

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws.current) {
        // Disable onclose handler before closing to prevent auto-reconnect on unmount
        ws.current.onclose = null;
        ws.current.close();
      }
      clearInterval(interval);
    };
  }, [connect]);

  const sendCommand = useCallback((type: 'MOVE' | 'DROP', direction?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type,
        direction: direction?.toUpperCase(),
        userId,
        machineId
      }));
    }
  }, [userId, machineId]);

  return {
    isConnected,
    latency,
    sendCommand
  };
}
