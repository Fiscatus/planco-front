import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/components';
import type {
  AcceptInviteResponse,
  CreateInviteDto,
  DeclineInviteResponse,
  DeleteInviteResponse,
  FilterInvitesDto,
  Invite,
  InviteResponseDto,
  PaginatedInvitesDto
} from '@/globals/types';
import { api } from '@/services';
import { useAuth } from './useAuth';

export const useInvites = () => {
  const { user, refreshToken } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchInvites = useCallback(
    async (filters: FilterInvitesDto = {}) => {
      if (!user?.org?._id) {
        setError('Usuário não possui organização');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get<PaginatedInvitesDto>('/invites', {
          params: {
            page: filters.page || '1',
            limit: filters.limit || '10',
            ...(filters.status && { status: filters.status }),
            ...(filters.email && { email: filters.email }),
            ...(filters.role && { role: filters.role })
          }
        });

        setInvites(response.data.invites);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar convites';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.org?._id]
  );

  const fetchUserInvites = useCallback(async (userEmail: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<InviteResponseDto[]>(`/invites/user/${userEmail}`);
      setInvites(response.data);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar convites do usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvite = useCallback(
    async (createInviteDto: CreateInviteDto) => {
      if (!user?.org?._id) {
        setError('Usuário não possui organização');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.post<InviteResponseDto>('/invites', createInviteDto);

        const currentFilters = { page: '1', limit: '10' };
        const refreshResponse = await api.get<PaginatedInvitesDto>('/invites', {
          params: currentFilters
        });
        setInvites(refreshResponse.data.invites);

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar convite';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.org?._id]
  );

  const deleteInvite = useCallback(
    async (inviteId: string) => {
      if (!user?.org?._id) {
        setError('Usuário não possui organização');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        await api.delete<DeleteInviteResponse>(`/invites/${inviteId}`);
        setInvites((prevInvites) => prevInvites.filter((invite) => invite._id !== inviteId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar convite';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.org?._id]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post<AcceptInviteResponse>(`/invites/${inviteId}/accept`);

        setInvites((prevInvites) => prevInvites.filter((invite) => invite._id !== inviteId));

        try {
          await refreshToken();
          navigate('/');
        } catch (refreshError) {
          console.warn('Erro ao atualizar token após aceitar convite:', refreshError);
        }

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao aceitar convite';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshToken, navigate]
  );

  const declineInvite = useCallback(async (inviteId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<DeclineInviteResponse>(`/invites/${inviteId}/decline`);

      setInvites((prevInvites) => prevInvites.filter((invite) => invite._id !== inviteId));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recusar convite';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(
    (filters: FilterInvitesDto = {}) => {
      return fetchInvites(filters);
    },
    [fetchInvites]
  );

  return {
    invites,
    loading,
    error,
    pagination,
    fetchInvites,
    fetchUserInvites,
    createInvite,
    deleteInvite,
    acceptInvite,
    declineInvite,
    clearError,
    refetch
  };
};
