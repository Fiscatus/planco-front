import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { FlowInstance } from './useFlowInstance';

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

const EVENT_REFETCH_MAP: Record<string, string[]> = {
  PROCESS_UPDATED:          ['flowInstance'],
  FILE_UPLOADED:            ['files', 'files-by-process'],
  FILE_SENT_TO_APPROVAL:    ['files', 'files-by-process', 'approval-pending'],
  FILES_BY_PROCESS_UPDATED: ['files', 'files-by-process'],
  APPROVAL_RESOLVED:        ['approval-pending', 'approval-history', 'files', 'files-by-process'],
  AUDIT_HISTORY_UPDATED:    ['approval-history'],
  COMMENT_ADDED:            ['comments'],
  CHECKLIST_UPDATED:        ['checklist'],
  TIMELINE_UPDATED:         ['timeline'],
  FORM_UPDATED:             ['form'],
  SIGNATURE_UPDATED:        ['signature'],
};

export const useFlowInstanceSSE = (instanceId: string | undefined, processId: string | undefined) => {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!instanceId || !processId) return;
    const token = getToken();
    if (!token) return;

    const connect = () => {
      const url = `${BASE_URL}/flows/instances/${instanceId}/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (event) => {
        if (!event.data) return;
        try {
          const data = JSON.parse(event.data);

          // Heartbeat — ignora
          if (data.type === 'ping' || data === 'ping') return;

          // Objeto completo da instância — atualiza cache direto sem refetch
          if (data._id) {
            queryClient.setQueryData(['flowInstance', processId], data as FlowInstance);
            return;
          }

          // Evento pontual — invalida queries específicas
          const keys = EVENT_REFETCH_MAP[data.type as string];
          if (keys) {
            keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
          }
        } catch {
          // JSON inválido ou string simples como 'ping', ignora
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Reconecta após 5s
        reconnectRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [instanceId, processId, queryClient]);
};
