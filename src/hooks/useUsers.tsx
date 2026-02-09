import { useCallback, useState } from 'react';
import type { FilterUsersDto, PaginatedUsersDto, ToggleUserStatusResponse, User } from '@/globals/types';

import { api } from '@/services';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchUsers = useCallback(async (filters: FilterUsersDto = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.departments?.length) {
        for (const dept of filters.departments) {
          params.append('departments', dept);
        }
      }
      if (filters.role) params.append('role', filters.role);

      const response = await api.get<PaginatedUsersDto>(`/users?${params.toString()}`);
      const data = response.data;

      setUsers(data.users);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar usuários';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserByEmail = useCallback(async (email: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<User>(`/users/${email}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId: string): Promise<ToggleUserStatusResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.patch<ToggleUserStatusResponse>(`/users/${userId}/toggle-status`);

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? { ...user, isActive: response.data.isActive } : user))
      );

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alterar status do usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateUserRole = useCallback(async (userId: string, roleId: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put<User>(`/users/${userId}/role`, { roleId });

      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, ...response.data } : user)));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar role do usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserDepartments = useCallback(async (userId: string, departmentIds: string[]): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put<User>(`/users/${userId}/departments`, { departmentIds });

      setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, ...response.data } : user)));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar departamentos do usuário';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(
    (filters: FilterUsersDto = {}) => {
      return fetchUsers(filters);
    },
    [fetchUsers]
  );

  return {
    users,
    loading,
    error,
    pagination,

    fetchUsers,
    fetchUserByEmail,
    updateUserRole,
    updateUserDepartments,
    toggleUserStatus,
    clearError,
    refetch
  };
};
