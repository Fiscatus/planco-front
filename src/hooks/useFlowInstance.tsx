import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

export type FlowInstance = {
  _id: string;
  process: {
    _id: string;
    processNumber: string;
    object: string;
    modality?: string;
    priority?: string;
    status: string;
    situation?: string;
    dueDate?: string;
    estimatedValue?: number;
    createdAt?: string;
    currentStage: string;
    participatingDepartments: Array<string | { _id: string; department_name: string; department_acronym: string }>;
    creatorDepartment: string | { _id: string; department_name: string; department_acronym: string };
    createdBy: string | { _id: string; email: string; firstName: string; lastName: string };
    managers?: Array<string | { _id: string; email: string; firstName: string; lastName: string }>;
  };
  flowModel: {
    _id: string;
    name: string;
    description: string;
  };
  currentStageOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  snapshotStages: Array<{
    stageId: string;
    order: number;
    name: string;
    description?: string;
    components: Array<{
      order: number;
      type: string;
      key: string;
      label: string;
      required: boolean;
      config?: any;
      visibilityRoles?: string[];
      editableRoles?: string[];
      lockedAfterCompletion?: boolean;
    }>;
    approverRoles?: Array<string | { _id: string; name: string }>;
    approverUsers?: Array<string | { _id: string; firstName: string; lastName: string }>;
    responsibleDepartments?: Array<string | { _id: string; department_name: string; department_acronym: string }>;
    businessDaysDuration?: number;
    isOptional?: boolean;
  }>;
  stageExecutions: Array<{
    stageId: string;
    stageOrder?: number;
    status?: string;
    startedAt?: string;
    completedAt?: string;
    auditLogs?: Array<{
      action: string;
      performedBy: string | { _id: string; email: string; firstName: string; lastName: string };
      performedAt: string;
      stageName?: string;
      componentKey?: string;
      componentLabel?: string;
      reason?: string;
    }>;
    componentData?: any[];
  }>;
  snapshotAuditLogs: any[];
};

export const useFlowInstance = (processId?: string, filters?: { stageName?: string; departmentId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['flowInstance', processId, filters],
    enabled: !!processId,
    placeholderData: (prev) => prev,
    queryFn: async (): Promise<FlowInstance> => {
      if (!processId) throw new Error('ID do processo não informado');
      const params = new URLSearchParams();
      if (filters?.stageName) params.set('stageName', filters.stageName);
      if (filters?.departmentId) params.set('departmentId', filters.departmentId);
      if (filters?.status) params.set('status', filters.status);
      const query = params.toString();
      const response = await api.get<FlowInstance>(`/flows/instances/process/${processId}${query ? `?${query}` : ''}`);
      return response.data;
    }
  });
};

export const useAdvanceStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, reason }: { instanceId: string; reason?: string }) => {
      const response = await api.post(`/flows/instances/${instanceId}/advance-stage`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useRollbackStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, reason }: { instanceId: string; reason: string }) => {
      const response = await api.post(`/flows/instances/${instanceId}/rollback-stage`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useUpdateProcess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ processId, data }: { processId: string; data: Record<string, any> }) => {
      const response = await api.put(`/processes/${processId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useUpdateStageResponsibleDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, stageId, departmentIds }: { instanceId: string; stageId: string; departmentIds: string[] }) => {
      const response = await api.patch(`/flows/instances/${instanceId}/stages/${stageId}/responsible-departments`, { departmentIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useAddOptionalStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, stageId }: { instanceId: string; stageId: string }) => {
      const response = await api.post(`/flows/instances/${instanceId}/optional-stages`, { stageId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useRemoveOptionalStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, stageId }: { instanceId: string; stageId: string }) => {
      const response = await api.delete(`/flows/instances/${instanceId}/optional-stages/${stageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};

export const useReorderStages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, stageOrders }: { instanceId: string; stageOrders: { stageId: string; order: number }[] }) => {
      const response = await api.patch(`/flows/instances/${instanceId}/stages/reorder`, { stages: stageOrders });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowInstance'] });
    }
  });
};
