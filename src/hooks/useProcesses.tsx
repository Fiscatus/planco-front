import type { FilterProcessesDto, Process, PaginatedProcesses, FolderStatsDto } from '@/globals/types';
import { useCallback } from 'react';

import { api } from '@/services';

export const useProcesses = () => {
  const fetchProcessesByFolder = useCallback(
    async (folderId: string, filters: FilterProcessesDto = {}) => {
      const params: {
        processNumber?: string;
        object?: string;
        currentStage?: string;
        status?: string;
        priority?: string;
        modality?: string;
      } = {};

      if (filters.processNumber) params.processNumber = filters.processNumber;
      if (filters.object) params.object = filters.object;
      if (filters.currentStage) params.currentStage = filters.currentStage;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.modality) params.modality = filters.modality;

      const response = await api.get<any>(`/folders/${folderId}/processes`, { params });

      // A API pode retornar array direto ou objeto paginado
      const processes = Array.isArray(response.data) ? response.data : (response.data.items || response.data.processes || []);

      return {
        processes,
        total: response.data.total || processes.length,
        page: response.data.page || 1,
        limit: response.data.limit || processes.length,
        totalPages: response.data.totalPages || 1
      };
    },
    []
  );

  const fetchFolderStats = useCallback(async (folderId: string): Promise<FolderStatsDto> => {
    const response = await api.get<FolderStatsDto>(`/folders/${folderId}/stats`);
    return response.data;
  }, []);

  return {
    fetchProcessesByFolder,
    fetchFolderStats
  };
};

