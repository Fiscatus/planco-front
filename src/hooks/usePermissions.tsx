import { useCallback, useState } from 'react';

import { api } from '@/services';
import type { PermissionDto, PermissionsResponseDto } from '@/globals/types';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async (): Promise<PermissionDto[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<PermissionsResponseDto>('/roles/permissions');
      setPermissions(response.data.permissions);
      return response.data.permissions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar permissões';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    permissions, 
    loading, 
    error, 
    fetchPermissions,
    clearError 
  };
};
