import { useCallback, useState } from 'react';

import { api } from '@/services';
import { useAuth } from './useAuth';

export type Role = {
  _id: string;
  name: string;
  permissions: string[];
  org: string;
};

export const useRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!user?.org?._id) {
      setError('Usuário não possui organização');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Role[]>(`/roles/org/${user.org._id}`);
      setRoles(response.data);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar roles';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.org?._id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    clearError
  };
};
