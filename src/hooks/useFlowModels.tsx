import { useCallback } from 'react';
import { api } from '@/services';

export type FlowModel = {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  stages?: any[];
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
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

  return {
    fetchFlowModels,
    findFlowModelById
  };
};


