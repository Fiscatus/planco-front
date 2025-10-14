import type { CreateDepartmentDto, Department, PaginatedDepartments, UpdateDepartmentDto } from '@/globals/types';
import { useCallback, useState } from 'react';

import { api } from '@/services';
import { useAuth } from './useAuth';

export const useDepartments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(
    async (page = 1, limit = 10, search = '') => {
      if (!user?.org?._id) {
        setError('Usuário não possui organização');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params: { page: number; limit: number; department_name?: string } = {
          page,
          limit
        };

        if (search) {
          params.department_name = search;
        }

        const response = await api.get<PaginatedDepartments>('/departments', { params });
        setDepartments(response.data.departments);

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar departamentos';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.org?._id]
  );

  const createDepartment = useCallback(async (data: CreateDepartmentDto) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post<Department>('/departments', data);

      // Atualizar lista local
      setDepartments((prev) => [response.data, ...prev]);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, data: UpdateDepartmentDto) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put<Department>(`/departments/${id}`, data);

      // Atualizar lista local
      setDepartments((prev) => prev.map((dept) => (dept._id === id ? response.data : dept)));

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      await api.delete(`/departments/${id}`);

      // Remover da lista local
      setDepartments((prev) => prev.filter((dept) => dept._id !== id));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDepartmentMembers = useCallback(async (departmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/departments/${departmentId}/members`);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar membros do departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartmentMembers = useCallback(async (departmentId: string, userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/departments/${departmentId}/members`, { userIds });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar membros do departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMembersBulk = useCallback(async (departmentId: string, userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/departments/${departmentId}/add-members`, { userIds });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar membros ao departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (departmentId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/departments/${departmentId}/members/${userId}`);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover membro do departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAccess = useCallback(async (userId: string, departmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/departments/check-access', {
        userId,
        departmentId
      });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar acesso ao departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDepartmentInfo = useCallback(async (departmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/departments/${departmentId}/info`);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar informações do departamento';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDepartments = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/departments/user/${userId}/departments`);

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar departamentos do usuário';
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
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentMembers,
    updateDepartmentMembers,
    addMembersBulk,
    removeMember,
    checkAccess,
    getDepartmentInfo,
    getUserDepartments,
    clearError
  };
};
