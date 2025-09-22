import { useEffect, useState } from 'react';

import type { Invite } from '@/globals/types';
import { api } from '@/services';
import { useAuth } from './useAuth';
import { useNotification } from '@/components';

export const useInvites = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const { data } = await api.get(`/invites/${user._id}`);
      setInvites(data);
    } catch (error: any) {
      console.error('Erro ao buscar convites:', error);
      showNotification('Erro ao carregar convites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      await api.post(`/invites/${inviteId}/accept`);
      showNotification('Convite aceito com sucesso!', 'success');
      fetchInvites();
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
    } catch (error: any) {
      console.error('Erro ao recusar convite:', error);
      showNotification('Erro ao recusar convite', 'error');
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [user?._id]);

  return {
    invites,
    loading,
    acceptInvite,
    declineInvite,
    refetch: fetchInvites
  };
};
