import { useCallback, useState } from 'react';

import { api } from '@/services';
import { useAuth } from './useAuth';

export type Department = {
  _id: string;
  department_name: string;
  description?: string;
  org: string;
};

export const useDepartments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    if (!user?.org?._id) {
      setError('Usuário não possui organização');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Department[]>(`/departments/org/${user.org._id}`);
      setDepartments(response.data);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar departamentos';
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
    departments,
    loading,
    error,
    fetchDepartments,
    clearError
  };
};
