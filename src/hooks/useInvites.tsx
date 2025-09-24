import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotification } from '@/components';
import type { Invite } from '@/globals/types';
import { api } from '@/services';
import { useAuth } from './useAuth';

export const useInvites = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchInvites = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/invites/${user._id}`);
      setInvites(data);
      // biome-ignore lint/suspicious/noExplicitAny: <TODO: create error type>
    } catch (error: any) {
      console.error('Erro ao buscar convites:', error);
      showNotification('Erro ao carregar convites', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?._id, showNotification]);

  const acceptInvite = async (inviteId: string) => {
    try {
      await api.post(`/invites/${inviteId}/accept`);
      showNotification('Convite aceito com sucesso!', 'success');
      fetchInvites();
      // biome-ignore lint/suspicious/noExplicitAny: <TODO: create error type>
    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      showNotification('Erro ao aceitar convite', 'error');
    }
  };

  const declineInvite = async (inviteId: string) => {
    try {
      await api.post(`/invites/${inviteId}/decline`);
      showNotification('Convite recusado', 'info');
      fetchInvites();
      // biome-ignore lint/suspicious/noExplicitAny: <TODO: create error type>
    } catch (error: any) {
      console.error('Erro ao recusar convite:', error);
      showNotification('Erro ao recusar convite', 'error');
    }
  };

  useEffect(() => {
    if (user?._id && !hasFetched.current) {
      hasFetched.current = true;
      fetchInvites();
    }
  }, [user?._id, fetchInvites]);

  return {
    invites,
    loading,
    acceptInvite,
    declineInvite,
    refetch: fetchInvites
  };
};
