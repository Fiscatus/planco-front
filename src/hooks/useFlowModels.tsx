import { useCallback } from 'react';
import { api } from '@/services';

export type FlowModelStage = {
  order: number;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  durationDays?: number;
  components: FlowModelComponent[];
};

export type FlowModelComponent = {
  order: number;
  type: string;
  name: string;
  description?: string;
  required?: boolean;
  data?: Record<string, any>;
};

export type FlowModel = {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefaultPlanco?: boolean;
  stages?: FlowModelStage[];
  org?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFlowModelDto = {
  name: string;
  description?: string;
  stages?: FlowModelStage[];
};

export type UpdateFlowModelDto = {
  name?: string;
  description?: string;
  stages?: FlowModelStage[];
  isActive?: boolean;
};

export const useFlowModels = () => {
  /**
   * Listar modelos de fluxo da organização
   * @param isActive - Filtrar por status ativo (opcional)
   * @returns Promise<FlowModel[]> - Array de modelos de fluxo
   */
  const fetchFlowModels = useCallback(
    async (isActive?: boolean): Promise<FlowModel[]> => {
      try {
        const params: { isActive?: boolean } = {};
        if (isActive !== undefined) {
          params.isActive = isActive;
        }

        const response = await api.get<FlowModel[]>('/flows/models', { params });

        return Array.isArray(response.data) ? response.data : [];
      } catch (error: any) {
        console.error('Erro ao buscar modelos de fluxo:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Buscar modelo de fluxo por ID
   * @param id - ID do modelo
   * @returns Promise<FlowModel> - Dados do modelo
   */
  const findFlowModelById = useCallback(
    async (id: string): Promise<FlowModel> => {
      try {
        const response = await api.get<FlowModel>(`/flows/models/${id}`);

        if (!response.data) {
          throw new Error('Resposta da API vazia ao buscar modelo de fluxo');
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao buscar modelo de fluxo:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Criar um novo modelo de fluxo
   * @param data - Dados do modelo para criar
   * @returns Promise<FlowModel> - Modelo criado
   */
  const createFlowModel = useCallback(
    async (data: CreateFlowModelDto): Promise<FlowModel> => {
      try {
        const response = await api.post<FlowModel>('/flows/models', data);

        if (!response.data) {
          throw new Error('Resposta da API vazia ao criar modelo de fluxo');
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao criar modelo de fluxo:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Atualizar modelo de fluxo
   * @param id - ID do modelo
   * @param data - Dados para atualizar
   * @returns Promise<FlowModel> - Modelo atualizado
   */
  const updateFlowModel = useCallback(
    async (id: string, data: UpdateFlowModelDto): Promise<FlowModel> => {
      try {
        const response = await api.put<FlowModel>(`/flows/models/${id}`, data);

        if (!response.data) {
          throw new Error('Resposta da API vazia ao atualizar modelo de fluxo');
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao atualizar modelo de fluxo:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Deletar modelo de fluxo
   * @param id - ID do modelo
   * @returns Promise<{ message: string }> - Mensagem de sucesso
   */
  const deleteFlowModel = useCallback(
    async (id: string): Promise<{ message: string }> => {
      try {
        const response = await api.delete<{ message: string }>(`/flows/models/${id}`);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao deletar modelo de fluxo:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Duplicar modelo de fluxo
   * @param id - ID do modelo a ser duplicado
   * @returns Promise<FlowModel> - Modelo duplicado
   */
  const duplicateFlowModel = useCallback(
    async (id: string): Promise<FlowModel> => {
      try {
        const response = await api.post<FlowModel>(`/flows/models/${id}/duplicate`);

        if (!response.data) {
          throw new Error('Resposta da API vazia ao duplicar modelo de fluxo');
        }

        return response.data;
      } catch (error: any) {
        console.error('Erro ao duplicar modelo de fluxo:', error);
        throw error;
      }
    },
    []
  );

  return {
    fetchFlowModels,
    findFlowModelById,
    createFlowModel,
    updateFlowModel,
    deleteFlowModel,
    duplicateFlowModel
  };
};


