'use client';

import { useState, useEffect, useRef } from 'react';
import { savePushSubscription } from '@/actions/push.actions';
import { urlBase64ToUint8Array } from '@/lib/utils';

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
        
        // Play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {
        console.error('Failed to parse notification message:', e);
      }
    };

    eventSourceRef.current = es;

    // Register for Web Push if supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerForPush();
    }

    return () => {
      es.close();
    };
  }, []);

  const registerForPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) return;

      const response = await fetch('/api/push/public-key');
      const { publicKey } = await response.json();
      if (!publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await savePushSubscription(JSON.parse(JSON.stringify(subscription)));
      console.log('Web Push subscription registered.');
    } catch (error) {
      console.error('Push registration failed:', error);
    }
  };

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
