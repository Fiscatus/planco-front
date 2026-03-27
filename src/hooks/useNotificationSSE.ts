import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppNotification } from '@/globals/types';

const BASE_URL = import.meta.env.VITE_API_URL as string;

const getToken = (): string | null => {
  try {
    const userData = localStorage.getItem('@planco:user');
    if (!userData) return null;
    return JSON.parse(userData)?.access_token ?? null;
  } catch {
    return null;
  }
};

type SSECallback = (notification: AppNotification) => void;

let globalES: EventSource | null = null;
let globalReconnect: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<SSECallback>();

const connect = (queryClient: ReturnType<typeof useQueryClient>) => {
  const token = getToken();
  if (!token || globalES) return;

  const url = `${BASE_URL}/notifications/events?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);
  globalES = es;

  es.onmessage = (event) => {
    if (!event.data) return;
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'ping') return;

      if (data.type === 'NOTIFICATION' && data.notification) {
        // Marca como stale sem refetch imediato — evita piscar a página
        queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'none' });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread'], refetchType: 'none' });
        // Atualiza o badge incrementando diretamente no cache
        queryClient.setQueryData(['notifications-unread'], (prev: number = 0) => prev + 1);
        listeners.forEach(cb => cb(data.notification));
      }

      if (data.type === 'BADGE_UPDATE' && typeof data.unread === 'number') {
        queryClient.setQueryData(['notifications-unread'], data.unread);
      }
    } catch {
      // ignora
    }
  };

  es.onerror = () => {
    es.close();
    globalES = null;
    globalReconnect = setTimeout(() => connect(queryClient), 5000);
  };
};

const disconnect = () => {
  globalES?.close();
  globalES = null;
  if (globalReconnect) clearTimeout(globalReconnect);
};

export const useNotificationSSE = (enabled: boolean, onNotification: SSECallback) => {
  const queryClient = useQueryClient();
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;

  useEffect(() => {
    if (!enabled) return;
    const cb: SSECallback = (n) => cbRef.current(n);
    listeners.add(cb);
    connect(queryClient);
    return () => {
      listeners.delete(cb);
      if (listeners.size === 0) disconnect();
    };
  }, [enabled, queryClient]);
};
