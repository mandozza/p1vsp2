'use client';

import { useState, useEffect, useRef } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    const es = new EventSource('/api/notifications/stream');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CONNECTED') return;

        setNotifications(prev => [data, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound if browser allows
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {
        console.error('Failed to parse notification message:', e);
      }
    };

    eventSourceRef.current = es;

    return () => {
      es.close();
    };
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    }
  };

  return { notifications, unreadCount, fetchNotifications };
}
