import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppNotification, NotificationFilters, PaginatedNotifications } from '@/globals/types';
import { api } from '@/services';

const QK = 'notifications';
const inv = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: [QK] });
  qc.invalidateQueries({ queryKey: ['notifications-unread'] });
};

export const useNotifications = (filters?: NotificationFilters) => {
  const queryClient = useQueryClient();

  const fetchNotifications = useCallback(async () => {
    const response = await api.get<PaginatedNotifications>('/notifications', { params: filters });
    return response.data;
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useQuery({
    queryKey: [QK, filters],
    queryFn: fetchNotifications,
    staleTime: 30 * 1000,
  });

  const markRead      = useMutation({ mutationFn: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`).then(r => r.data), onSuccess: () => inv(queryClient) });
  const markAllRead   = useMutation({ mutationFn: () => api.patch('/notifications/read-all').then(r => r.data), onSuccess: () => inv(queryClient) });
  const toggleStar    = useMutation({ mutationFn: (id: string) => api.patch<AppNotification>(`/notifications/${id}/star`).then(r => r.data), onSuccess: () => inv(queryClient) });
  const archive       = useMutation({ mutationFn: (id: string) => api.patch<AppNotification>(`/notifications/${id}/archive`).then(r => r.data), onSuccess: () => inv(queryClient) });
  const unarchive     = useMutation({ mutationFn: (id: string) => api.patch<AppNotification>(`/notifications/${id}/unarchive`).then(r => r.data), onSuccess: () => inv(queryClient) });
  const deleteOne     = useMutation({ mutationFn: (id: string) => api.delete(`/notifications/${id}`), onSuccess: () => inv(queryClient) });
  const deleteAllRead = useMutation({ mutationFn: () => api.delete('/notifications'), onSuccess: () => inv(queryClient) });

  // Bulk
  const bulkRead      = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/read',      { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });
  const bulkStar      = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/star',      { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });
  const bulkUnstar    = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/unstar',    { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });
  const bulkArchive   = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/archive',   { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });
  const bulkUnarchive = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/unarchive', { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });
  const bulkDelete    = useMutation({ mutationFn: (ids: string[]) => api.post('/notifications/bulk/delete',    { ids }).then(r => r.data), onSuccess: () => inv(queryClient) });

  return { ...query, markRead, markAllRead, toggleStar, archive, unarchive, deleteOne, deleteAllRead, bulkRead, bulkStar, bulkUnstar, bulkArchive, bulkUnarchive, bulkDelete };
};

export const useNotificationPreview = (enabled: boolean) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['notifications-preview'],
    queryFn: async () => {
      const r = await api.get<{ items: AppNotification[]; unread: number }>('/notifications/preview?limit=5');
      queryClient.setQueryData(['notifications-unread'], r.data.unread);
      return r.data;
    },
    enabled,
    staleTime: 0,
  });
};

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get<{ unread: number }>('/notifications/unread-count').then(r => r.data.unread),
    staleTime: 30 * 1000,
  });
