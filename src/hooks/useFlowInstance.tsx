import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';

export type FlowInstance = {
  _id: string;
  process: {
    _id: string;
    processNumber: string;
    object: string;
    status: string;
    participatingDepartments: string[];
    creatorDepartment: string;
    createdBy: string;
    currentStage: string;
  };
  flowModel: {
    _id: string;
    name: string;
    description: string;
  };
  currentStageOrder: number;
  status: string;
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
    approverRoles?: string[];
    approverUsers?: string[];
    responsibleDepartments?: string[];
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
      performedBy: string;
      performedAt: string;
      stageName?: string;
      componentKey?: string;
      componentLabel?: string;
      reason?: string;
    }>;
    componentData?: any[];
  }>;
  snapshotAuditLogs: any[];
  createdAt: string;
  updatedAt: string;
};

export const useFlowInstance = (processId?: string) => {
  return useQuery({
    queryKey: ['flowInstance', processId],
    enabled: !!processId,
    queryFn: async (): Promise<FlowInstance> => {
      if (!processId) throw new Error('ID do processo não informado');
      const response = await api.get<FlowInstance>(`/flows/instances/process/${processId}`);
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
