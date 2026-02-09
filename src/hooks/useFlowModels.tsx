import { useCallback } from "react";
import { api } from "@/services";

/**
 * Tipos alinhados ao backend (FlowModel schema + DTOs)
 */

export type ComponentType =
  | "SIGNATURE"
  | "COMMENTS"
  | "FORM"
  | "APPROVAL"
  | "FILES_MANAGEMENT"
  | "STAGE_PANEL"
  | "TIMELINE"
  | "FILE_VIEWER"
  | "CHECKLIST"
  | "STAGE_SUMMARY";

export type FlowModelComponent = {
  order: number;
  type: ComponentType;
  key: string;
  label: string;
  description?: string;
  required: boolean;
  config?: Record<string, any>;
  visibilityRoles?: string[]; // backend usa ObjectId; no front tratamos como string
  editableRoles?: string[];
  lockedAfterCompletion?: boolean;
};

export type FlowModelStage = {
  stageId: string;
  order: number;
  name: string;
  description?: string;
  components: FlowModelComponent[];
  requiresApproval: boolean;
  approverRoles?: string[];
  approverDepartments?: string[];
  canRepeat?: boolean;
  repeatCondition?: string;
  visibilityCondition?: string;
};

export type FlowModel = {
  _id: string;
  name: string;
  description?: string;
  org?: string;
  stages: FlowModelStage[];
  isActive: boolean;
  isDefaultPlanco: boolean;
  isPublicTemplate?: boolean;
  tags?: string[];
  createdBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type CreateFlowModelDto = {
  name: string;
  description?: string;
  stages: FlowModelStage[];
  isActive?: boolean;
  isPublicTemplate?: boolean;
  tags?: string[];
};

export type UpdateFlowModelDto = {
  name?: string;
  description?: string;
  stages?: FlowModelStage[];
  isActive?: boolean;
  tags?: string[];
};

export const useFlowModels = () => {
  /**
   * GET /flow-models?isActive=true|false
   */
  const fetchFlowModels = useCallback(
    async (isActive?: boolean): Promise<FlowModel[]> => {
      const params: { isActive?: boolean } = {};
      if (isActive !== undefined) params.isActive = isActive;

      const response = await api.get<FlowModel[]>("/flow-models", { params });
      return Array.isArray(response.data) ? response.data : [];
    },
    [],
  );

  /**
   * GET /flow-models/:id
   */
  const findFlowModelById = useCallback(async (id: string): Promise<FlowModel> => {
    const response = await api.get<FlowModel>(`/flow-models/${id}`);

    if (!response.data) {
      throw new Error("Resposta da API vazia ao buscar modelo de fluxo");
    }

    return response.data;
  }, []);

  /**
   * POST /flow-models
   */
  const createFlowModel = useCallback(
    async (data: CreateFlowModelDto): Promise<FlowModel> => {
      const response = await api.post<FlowModel>("/flow-models", data);

      if (!response.data) {
        throw new Error("Resposta da API vazia ao criar modelo de fluxo");
      }

      return response.data;
    },
    [],
  );

  /**
   * PUT /flow-models/:id
   */
  const updateFlowModel = useCallback(
    async (id: string, data: UpdateFlowModelDto): Promise<FlowModel> => {
      const response = await api.put<FlowModel>(`/flow-models/${id}`, data);

      if (!response.data) {
        throw new Error("Resposta da API vazia ao atualizar modelo de fluxo");
      }

      return response.data;
    },
    [],
  );

  /**
   * DELETE /flow-models/:id
   */
  const deleteFlowModel = useCallback(async (id: string): Promise<any> => {
    const response = await api.delete<any>(`/flow-models/${id}`);
    return response.data;
  }, []);

  /**
   * POST /flow-models/:id/duplicate
   * Duplica um modelo existente e retorna o novo modelo.
   */
  const duplicateFlowModel = useCallback(async (id: string): Promise<FlowModel> => {
    const response = await api.post<FlowModel>(`/flow-models/${id}/duplicate`);

    if (!response.data) {
      throw new Error("Resposta da API vazia ao duplicar modelo de fluxo");
    }

    return response.data;
  }, []);

  return {
    fetchFlowModels,
    findFlowModelById,
    createFlowModel,
    updateFlowModel,
    deleteFlowModel,
    duplicateFlowModel,
  };
};
