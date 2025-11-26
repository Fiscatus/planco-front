import type { FilterProcessesDto, Process, PaginatedProcesses, FolderStatsDto, CreateProcessDto, UpdateProcessDto, MoveProcessesDto } from '@/globals/types';
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
        page?: number;
        limit?: number;
      } = {};

      if (filters.processNumber) params.processNumber = filters.processNumber;
      if (filters.object) params.object = filters.object;
      if (filters.currentStage) params.currentStage = filters.currentStage;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.modality) params.modality = filters.modality;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

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

  /**
   * Listar processos com filtros (endpoint principal GET /processes)
   * @param filters - Filtros para busca de processos (departmentId, status, processNumber, etc.)
   * @returns Promise<PaginatedProcesses> - Array de processos com paginação
   */
  const fetchProcesses = useCallback(
    async (filters: FilterProcessesDto = {}) => {
      const params: {
        departmentId?: string;
        processNumber?: string;
        object?: string;
        currentStage?: string;
        status?: string;
        priority?: string;
        modality?: string;
        page?: number;
        limit?: number;
      } = {};

      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.processNumber) params.processNumber = filters.processNumber;
      if (filters.object) params.object = filters.object;
      if (filters.currentStage) params.currentStage = filters.currentStage;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.modality) params.modality = filters.modality;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      try {
        const response = await api.get<any>('/processes', { params });

        // Validar resposta da API
        if (!response.data) {
          console.warn('Resposta da API vazia ou inválida');
          return {
            processes: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1
          };
        }

        // A API retorna { items, total, page, limit, totalPages }
        const processes = Array.isArray(response.data) 
          ? response.data 
          : (response.data.items || response.data.processes || []);

        return {
          processes: Array.isArray(processes) ? processes : [],
          total: response.data.total ?? 0,
          page: response.data.page ?? 1,
          limit: response.data.limit ?? 10,
          totalPages: response.data.totalPages ?? 1
        };
      } catch (error: any) {
        console.error('Erro ao buscar processos:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Listar processos por departamento (usa GET /processes com departmentId)
   * @param departmentId - ID do departamento
   * @param filters - Filtros adicionais para busca de processos
   * @returns Promise<PaginatedProcesses> - Array de processos com paginação
   */
  const fetchProcessesByDepartment = useCallback(
    async (departmentId: string, filters: FilterProcessesDto = {}) => {
      // Usar o endpoint principal com departmentId no filtro
      return await fetchProcesses({ ...filters, departmentId });
    },
    [fetchProcesses]
  );

  /**
   * Criar um novo processo
   * @param data - Dados do processo para criar
   * @returns Promise<Process> - Processo criado
   */
  const createProcess = useCallback(async (data: CreateProcessDto) => {
    try {
      const response = await api.post<Process>('/processes', data);
      
      if (!response.data) {
        throw new Error('Resposta da API vazia ao criar processo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar processo:', error);
      throw error;
    }
  }, []);

  /**
   * Buscar processo por ID
   * @param id - ID do processo
   * @returns Promise<Process> - Dados do processo
   */
  const findProcessById = useCallback(async (id: string) => {
    try {
      const response = await api.get<Process>(`/processes/${id}`);
      
      if (!response.data) {
        throw new Error('Resposta da API vazia ao buscar processo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar processo:', error);
      throw error;
    }
  }, []);

  /**
   * Atualizar processo
   * @param id - ID do processo
   * @param data - Dados para atualizar
   * @returns Promise<Process> - Processo atualizado
   */
  const updateProcess = useCallback(async (id: string, data: UpdateProcessDto) => {
    try {
      const response = await api.put<Process>(`/processes/${id}`, data);
      
      if (!response.data) {
        throw new Error('Resposta da API vazia ao atualizar processo');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar processo:', error);
      throw error;
    }
  }, []);

  /**
   * Mover processos entre pastas
   * @param data - DTO com IDs dos processos e pasta destino
   * @returns Promise<{ message: string }> - Mensagem de sucesso
   */
  const moveProcesses = useCallback(async (data: MoveProcessesDto) => {
    try {
      const response = await api.post<{ message: string }>('/processes/move', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao mover processos:', error);
      throw error;
    }
  }, []);

  const fetchFolderStats = useCallback(async (folderId: string): Promise<FolderStatsDto> => {
    const response = await api.get<FolderStatsDto>(`/folders/${folderId}/stats`);
    return response.data;
  }, []);

  return {
    fetchProcessesByFolder,
    fetchProcesses,
    fetchProcessesByDepartment,
    createProcess,
    findProcessById,
    updateProcess,
    moveProcesses,
    fetchFolderStats
  };
};

