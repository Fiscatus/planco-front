import type { CreateFolderDto, FilterFoldersDto, Folder, UpdateFolderDto, MoveProcessesDto } from '@/globals/types';
import { useCallback } from 'react';

import { api } from '@/services';

export const useFolders = () => {
  const fetchFolders = useCallback(
    async (filters: FilterFoldersDto = {}) => {
      const params: { page?: number; limit?: number; name?: string; year?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {};

      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
      if (filters.search) params.name = filters.search;
      if (filters.year) params.year = filters.year;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get<any>('/folders', { params });

      // A API retorna 'items', mapear para 'folders' e normalizar description/observations
      const folders = (response.data.items || response.data.folders || []).map((folder: any) => ({
        ...folder,
        description: folder.description || folder.observations
      }));

      return {
        folders,
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 12,
        totalPages: response.data.totalPages || 1
      };
    },
    []
  );

  const createFolder = useCallback(async (data: CreateFolderDto) => {
    const response = await api.post<Folder>('/folders', data);
    return response.data;
  }, []);

  const updateFolder = useCallback(async (id: string, data: UpdateFolderDto) => {
    const response = await api.put<Folder>(`/folders/${id}`, data);
    return response.data;
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    await api.delete(`/folders/${id}`);
    return true;
  }, []);

  const fetchFolderById = useCallback(async (id: string) => {
    const response = await api.get<Folder>(`/folders/${id}`);
    // Normalizar description/observations
    return {
      ...response.data,
      description: (response.data as any).description || (response.data as any).observations
    };
  }, []);

  const moveProcesses = useCallback(async (data: MoveProcessesDto) => {
    const response = await api.post(`/processes/move`, data);
    return response.data;
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    // Se a API não tiver este endpoint, implementar lógica local se necessário
    // Por enquanto, apenas um placeholder
    throw new Error('Toggle favorite não implementado na API');
  }, []);

  return {
    fetchFolders,
    fetchFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
    moveProcesses,
    toggleFavorite
  };
};
