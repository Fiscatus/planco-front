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
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/flows/instances/${instanceId}/events`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;

            try {
              const data = JSON.parse(raw);

              // Objeto completo da instância — atualiza cache direto sem refetch
              if (data._id) {
                queryClient.setQueryData(['flowInstance', processId], data as FlowInstance);
                continue;
              }

              // Evento pontual — invalida queries específicas
              const keys = EVENT_REFETCH_MAP[data.type as string];
              if (keys) {
                keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
              }
            } catch {
              // linha inválida, ignora
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // Reconecta após 5s em caso de erro de rede
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      controller.abort();
      clearTimeout(reconnectTimeout);
    };
  }, [instanceId, processId, queryClient]);
};
