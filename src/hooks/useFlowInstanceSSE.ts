import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchEventSource } from '@microsoft/fetch-event-source';
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
  FILE_UPLOADED:         ['files'],
  FILE_SENT_TO_APPROVAL: ['files', 'approval-pending', 'approval-history'],
  COMMENT_ADDED:         ['comments'],
  CHECKLIST_UPDATED:     ['checklist'],
  TIMELINE_UPDATED:      ['timeline'],
  FORM_UPDATED:          ['form'],
  SIGNATURE_UPDATED:     ['signature'],
};

export const useFlowInstanceSSE = (instanceId: string | undefined, processId: string | undefined) => {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!instanceId || !processId) return;
    const token = getToken();
    if (!token) return;

    const controller = new AbortController();
    abortRef.current = controller;

    fetchEventSource(`${BASE_URL}/flows/instances/${instanceId}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      openWhenHidden: false, // pausa quando aba não está visível

      onmessage(event) {
        if (!event.data || event.data === 'ping') return;

        try {
          const data = JSON.parse(event.data);

          // Objeto completo da instância — atualiza cache direto
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
          // JSON inválido, ignora
        }
      },

      onerror(err) {
        // Lança o erro para o fetchEventSource reconectar automaticamente
        throw err;
      },
    });

    return () => {
      controller.abort();
    };
  }, [instanceId, processId, queryClient]);
};
