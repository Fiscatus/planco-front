import { useCallback, useState } from 'react';

import { api } from '@/services';
import { useAuth } from './useAuth';
import type { CreateRoleDto, Role, RoleDeleteImpact, RoleDeleteResponse, UpdateRoleDto } from '@/globals/types';

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

  const fetchRoleById = useCallback(async (roleId: string): Promise<Role> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Role>(`/roles/${roleId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar role';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (roleData: CreateRoleDto): Promise<Role> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<Role>('/roles', roleData);

      setRoles((prevRoles) => [...prevRoles, response.data]);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar role';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (roleId: string, updateData: UpdateRoleDto): Promise<Role> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put<Role>(`/roles/${roleId}`, updateData);

      setRoles((prevRoles) => prevRoles.map((role) => (role._id === roleId ? { ...role, ...response.data } : role)));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar role';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDeleteImpact = useCallback(async (roleId: string): Promise<RoleDeleteImpact> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<RoleDeleteImpact>(`/roles/${roleId}/delete-impact`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar impacto da exclusão';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (roleId: string): Promise<RoleDeleteResponse> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete<RoleDeleteResponse>(`/roles/${roleId}`);

      setRoles((prevRoles) => prevRoles.filter((role) => role._id !== roleId));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar role';
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
    roles,
    loading,
    error,
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    checkDeleteImpact,
    deleteRole,
    clearError
  };
};
