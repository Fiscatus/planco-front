import { useQuery } from '@tanstack/react-query';
import type {
  Process,
  ProcessComponentType,
  ProcessFlowComponentState,
  ProcessFlowSnapshotMeta,
  ProcessFlowStageCard,
  ProcessFlowState,
  ProcessStageStatus
} from '@/globals/types';
import { api } from '@/services';
import { type FlowModelStage, useFlowModels } from './useFlowModels';
import { useProcesses } from './useProcesses';

type UseProcessFlowStateOptions = {
  resolveComponentData?: boolean;
};

type UnknownRecord = Record<string, unknown>;

type SnapshotComponentRecord = {
  key: string;
  type: ProcessComponentType;
  label: string;
  required: boolean;
};

type StageSourceRecord = {
  stageId: string;
  order: number;
  name: string;
  components: SnapshotComponentRecord[];
  approverRoles?: string[];
  approverUsers?: string[];
};

type StageExecutionRecord = {
  stageId: string;
  stageOrder?: number;
  status?: string;
};

const DEFAULT_STAGE_FALLBACK = 'Gerência não informada';

const COMPONENT_ENDPOINT_BY_TYPE: Record<ProcessComponentType, string | null> = {
  FORM: '/forms',
  CHECKLIST: '/checklist',
  COMMENTS: '/comments',
  FILES_MANAGEMENT: '/files',
  TIMELINE: '/timeline',
  SIGNATURE: '/signatures',
  APPROVAL: '/approvals',
  STAGE_PANEL: null
};

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedNumber = Number(value);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber;
    }
  }

  return undefined;
};

const asSnapshotVersion = (value: unknown): string | number | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return undefined;
};

const getValueFromPath = (record: UnknownRecord, path: string[]): unknown => {
  let currentValue: unknown = record;

  for (const key of path) {
    if (!isRecord(currentValue)) {
      return undefined;
    }

    currentValue = currentValue[key];
  }

  return currentValue;
};

const pickFirstStringByPaths = (record: UnknownRecord, paths: string[][]): string | undefined => {
  for (const path of paths) {
    const value = getValueFromPath(record, path);
    const normalizedValue = asString(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return undefined;
};

const pickFirstSnapshotVersionByPaths = (record: UnknownRecord, paths: string[][]): string | number | undefined => {
  for (const path of paths) {
    const value = getValueFromPath(record, path);
    const normalizedValue = asSnapshotVersion(value);

    if (normalizedValue !== undefined) {
      return normalizedValue;
    }
  }

  return undefined;
};

const isProcessComponentType = (value: unknown): value is ProcessComponentType => {
  return typeof value === 'string' && value in COMPONENT_ENDPOINT_BY_TYPE;
};

const toProcessComponentType = (value: unknown): ProcessComponentType => {
  if (isProcessComponentType(value)) {
    return value;
  }

  return 'STAGE_PANEL';
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (isRecord(item)) {
        return asString(item._id) ?? asString(item.id) ?? undefined;
      }

      return undefined;
    })
    .filter((item): item is string => !!item);
};

const buildComponentInstanceKey = (params: {
  processInstanceId: string;
  stageInstanceId: string;
  componentKey: string;
}) => {
  return `${params.processInstanceId}:${params.stageInstanceId}:${params.componentKey}`;
};

const extractFlowModelId = (process: Process, processRecord: UnknownRecord): string | undefined => {
  const workflowModelValue = process.workflowModel;

  if (typeof workflowModelValue === 'string' && workflowModelValue.trim()) {
    return workflowModelValue;
  }

  if (isRecord(workflowModelValue)) {
    const nestedWorkflowModelId = asString(workflowModelValue._id);
    if (nestedWorkflowModelId) {
      return nestedWorkflowModelId;
    }
  }

  if (process.workflowModelId) {
    return process.workflowModelId;
  }

  if (process.flowModelId) {
    return process.flowModelId;
  }

  return pickFirstStringByPaths(processRecord, [
    ['workflowModelId'],
    ['workflowModel'],
    ['workflowModel', '_id'],
    ['flowModelId'],
    ['flowModel', '_id']
  ]);
};

const fetchFlowInstanceByProcess = async (processId: string): Promise<UnknownRecord | null> => {
  try {
    const response = await api.get<unknown>(`/flows/instances/process/${processId}`);

    if (isRecord(response.data)) {
      return response.data;
    }

    return null;
  } catch {
    return null;
  }
};

const extractProcessInstanceId = (params: {
  processRecord: UnknownRecord;
  flowInstanceRecord: UnknownRecord | null;
  processId: string;
}): string => {
  if (params.flowInstanceRecord) {
    const fromFlowInstance = pickFirstStringByPaths(params.flowInstanceRecord, [['_id'], ['id'], ['instanceId']]);
    if (fromFlowInstance) {
      return fromFlowInstance;
    }
  }

  const flowInstanceValue = params.processRecord.flowInstance;
  if (typeof flowInstanceValue === 'string' && flowInstanceValue.trim()) {
    return flowInstanceValue;
  }

  if (isRecord(flowInstanceValue)) {
    const relatedId = asString(flowInstanceValue._id);
    if (relatedId) {
      return relatedId;
    }
  }

  return (
    pickFirstStringByPaths(params.processRecord, [
      ['processInstanceId'],
      ['flowInstanceId'],
      ['instanceId'],
      ['currentFlowInstance', '_id'],
      ['currentFlowInstanceId']
    ]) ?? params.processId
  );
};

const extractSnapshotMeta = (params: {
  processRecord: UnknownRecord;
  flowInstanceRecord: UnknownRecord | null;
  processInstanceId: string;
}): ProcessFlowSnapshotMeta => {
  const snapshotVersionFromFlow = params.flowInstanceRecord
    ? pickFirstSnapshotVersionByPaths(params.flowInstanceRecord, [
        ['snapshotVersion'],
        ['snapshot', 'version'],
        ['updatedAt']
      ])
    : undefined;

  const snapshotVersionFromProcess = pickFirstSnapshotVersionByPaths(params.processRecord, [
    ['snapshotVersion'],
    ['snapshot', 'version'],
    ['updatedAt']
  ]);

  const etag =
    (params.flowInstanceRecord
      ? pickFirstStringByPaths(params.flowInstanceRecord, [['snapshotEtag'], ['etag']])
      : undefined) ?? pickFirstStringByPaths(params.processRecord, [['snapshotEtag'], ['etag']]);

  return {
    processInstanceId: params.processInstanceId,
    snapshotVersion: snapshotVersionFromFlow ?? snapshotVersionFromProcess,
    etag,
    sourceEndpoint: '/flows/instances/process/:processId'
  };
};

const extractStageExecutions = (flowInstanceRecord: UnknownRecord | null): StageExecutionRecord[] => {
  if (!flowInstanceRecord) {
    return [];
  }

  const stageExecutionsValue = flowInstanceRecord.stageExecutions;
  if (!Array.isArray(stageExecutionsValue)) {
    return [];
  }

  const normalizedExecutions: StageExecutionRecord[] = [];

  for (const item of stageExecutionsValue) {
    if (!isRecord(item)) {
      continue;
    }

    const stageId = asString(item.stageId);
    if (!stageId) {
      continue;
    }

    normalizedExecutions.push({
      stageId,
      stageOrder: asNumber(item.stageOrder),
      status: asString(item.status)
    });
  }

  return normalizedExecutions;
};

const extractSnapshotStages = (flowInstanceRecord: UnknownRecord | null): StageSourceRecord[] => {
  if (!flowInstanceRecord) {
    return [];
  }

  const snapshotStagesValue = flowInstanceRecord.snapshotStages;
  if (!Array.isArray(snapshotStagesValue)) {
    return [];
  }

  const normalizedStages: StageSourceRecord[] = [];

  for (const [index, stageValue] of snapshotStagesValue.entries()) {
    if (!isRecord(stageValue)) {
      continue;
    }

    const stageId = asString(stageValue.stageId);
    const order = asNumber(stageValue.order);
    const name = asString(stageValue.name);

    if (!stageId || !name) {
      continue;
    }

    const components: SnapshotComponentRecord[] = [];
    const componentsValue = stageValue.components;

    if (Array.isArray(componentsValue)) {
      for (const componentValue of componentsValue) {
        if (!isRecord(componentValue)) {
          continue;
        }

        const key = asString(componentValue.key);
        if (!key) {
          continue;
        }

        const componentType = toProcessComponentType(asString(componentValue.type));
        const label = asString(componentValue.label) ?? key;

        components.push({
          key,
          type: componentType,
          label,
          required: Boolean(componentValue.required)
        });
      }
    }

    normalizedStages.push({
      stageId,
      order: order ?? index + 1,
      name,
      components,
      approverRoles: toStringArray(stageValue.approverRoles),
      approverUsers: toStringArray(stageValue.approverUsers)
    });
  }

  return normalizedStages.sort((left, right) => left.order - right.order);
};

const toStageSourcesFromFlowModel = (stages: FlowModelStage[]): StageSourceRecord[] => {
  return [...stages]
    .sort((left, right) => left.order - right.order)
    .map((stage) => {
      return {
        stageId: stage.stageId,
        order: stage.order,
        name: stage.name,
        components: (stage.components || []).map((component) => ({
          key: component.key,
          type: toProcessComponentType(component.type),
          label: component.label,
          required: component.required
        })),
        approverRoles: stage.approverRoles || [],
        approverUsers: stage.approverUsers || []
      } satisfies StageSourceRecord;
    });
};

const buildExecutionStatusByStageId = (executions: StageExecutionRecord[]) => {
  const statusByStageId: Record<string, string | undefined> = {};

  for (const execution of executions) {
    statusByStageId[execution.stageId] = execution.status;
  }

  return statusByStageId;
};

const buildStageInstancesByStageId = (params: { stageSources: StageSourceRecord[]; processInstanceId: string }) => {
  const map: Record<string, string> = {};

  for (const stage of params.stageSources) {
    map[stage.stageId] = stage.stageId;
  }

  return map;
};

const resolveStageStatusFromExecution = (executionStatus: string | undefined): ProcessStageStatus => {
  if (!executionStatus) {
    return 'pending';
  }

  if (executionStatus === 'APPROVED' || executionStatus === 'COMPLETED') {
    return 'completed';
  }

  if (executionStatus === 'IN_PROGRESS' || executionStatus === 'WAITING_APPROVAL') {
    return 'in_progress';
  }

  return 'pending';
};

const resolveStageAdditionalInfo = (executionStatus: string | undefined, status: ProcessStageStatus) => {
  if (executionStatus === 'WAITING_APPROVAL') {
    return 'Aguardando aprovação';
  }

  if (executionStatus === 'REJECTED') {
    return 'Etapa rejeitada';
  }

  if (status === 'completed') {
    return 'Etapa concluída';
  }

  if (status === 'in_progress') {
    return 'Etapa atual';
  }

  return 'Aguardando etapa anterior';
};

const resolveStageDepartment = (stage: StageSourceRecord) => {
  if (stage.approverRoles && stage.approverRoles.length > 0) {
    return stage.approverRoles[0];
  }

  if (stage.approverUsers && stage.approverUsers.length > 0) {
    return stage.approverUsers[0];
  }

  return DEFAULT_STAGE_FALLBACK;
};

const resolveStatusByProcessFallback = (params: {
  stage: StageSourceRecord;
  process: Process;
  stageSources: StageSourceRecord[];
}): ProcessStageStatus => {
  if (params.process.status === 'Concluído') {
    return 'completed';
  }

  const currentStage = params.process.currentStage;
  if (!currentStage) {
    return params.stage.order === 1 ? 'in_progress' : 'pending';
  }

  const currentStageIndex = params.stageSources.findIndex((stage) => {
    return stage.stageId === currentStage || stage.name === currentStage;
  });

  if (currentStageIndex < 0) {
    return params.stage.order === 1 ? 'in_progress' : 'pending';
  }

  const stageIndex = params.stageSources.findIndex((stage) => stage.stageId === params.stage.stageId);
  if (stageIndex < currentStageIndex) {
    return 'completed';
  }

  if (stageIndex === currentStageIndex) {
    return 'in_progress';
  }

  return 'pending';
};

const toStageCards = (params: {
  process: Process;
  processId: string;
  stageSources: StageSourceRecord[];
  processInstanceId: string;
  stageInstancesByStageId: Record<string, string>;
  executionStatusByStageId: Record<string, string | undefined>;
}) => {
  return params.stageSources.map((stage): ProcessFlowStageCard => {
    const executionStatus = params.executionStatusByStageId[stage.stageId];
    const status = executionStatus
      ? resolveStageStatusFromExecution(executionStatus)
      : resolveStatusByProcessFallback({
          stage,
          process: params.process,
          stageSources: params.stageSources
        });

    const stageInstanceId =
      params.stageInstancesByStageId[stage.stageId] ?? `${params.processInstanceId}:${stage.stageId}`;

    return {
      id: `${params.processId}:${stage.stageId}`,
      order: stage.order,
      stageId: stage.stageId,
      stageInstanceId,
      title: stage.name,
      departments: [resolveStageDepartment(stage)],
      status,
      additionalInfo: resolveStageAdditionalInfo(executionStatus, status),
      components: stage.components.map((component) => ({
        componentKey: component.key,
        componentType: component.type,
        label: component.label,
        required: component.required
      }))
    };
  });
};

const normalizeErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const buildRequestParams = (params: Record<string, unknown>): Record<string, string | number | boolean> => {
  const normalized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.trim()) {
      normalized[key] = value;
      continue;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      normalized[key] = value;
    }
  }

  return normalized;
};

const fetchComponentState = async (params: {
  processId: string;
  processInstanceId: string;
  snapshotVersion?: string | number;
  stage: ProcessFlowStageCard;
  component: ProcessFlowStageCard['components'][number];
}) => {
  const endpoint = COMPONENT_ENDPOINT_BY_TYPE[params.component.componentType];

  const componentInstanceKey = buildComponentInstanceKey({
    processInstanceId: params.processInstanceId,
    stageInstanceId: params.stage.stageInstanceId,
    componentKey: params.component.componentKey
  });

  if (!endpoint) {
    return {
      componentInstanceKey,
      state: null,
      error: 'Componente sem endpoint remoto configurado no front.',
      stale: false
    };
  }

  const commonContext = {
    processId: params.processId,
    processInstanceId: params.processInstanceId,
    stageId: params.stage.stageId,
    stageInstanceId: params.stage.stageInstanceId,
    componentKey: params.component.componentKey,
    componentType: params.component.componentType,
    snapshotVersion: params.snapshotVersion
  };

  const requestParams =
    params.component.componentType === 'APPROVAL'
      ? buildRequestParams({
          instanceId: params.processInstanceId,
          stageId: params.stage.stageId,
          componentKey: params.component.componentKey
        })
      : buildRequestParams(commonContext);

  try {
    const response = await api.get<unknown>(endpoint, { params: requestParams });
    const payload = response.data;
    const payloadRecord = isRecord(payload) ? payload : null;

    const responseSnapshotVersion = payloadRecord
      ? pickFirstSnapshotVersionByPaths(payloadRecord, [['snapshotVersion'], ['meta', 'snapshotVersion']])
      : undefined;

    const stale =
      params.snapshotVersion !== undefined &&
      responseSnapshotVersion !== undefined &&
      responseSnapshotVersion !== params.snapshotVersion;

    const componentState: ProcessFlowComponentState = {
      processId: params.processId,
      processInstanceId: params.processInstanceId,
      stageId: params.stage.stageId,
      stageInstanceId: params.stage.stageInstanceId,
      componentKey: params.component.componentKey,
      componentType: params.component.componentType,
      endpoint,
      snapshotVersion: responseSnapshotVersion ?? params.snapshotVersion,
      fetchedAt: new Date().toISOString(),
      data: payload
    };

    return {
      componentInstanceKey,
      state: componentState,
      error: null,
      stale
    };
  } catch (error: unknown) {
    return {
      componentInstanceKey,
      state: null,
      error: normalizeErrorMessage(error, 'Falha ao buscar dados do componente.'),
      stale: false
    };
  }
};

const createEmptyComponentMaps = () => {
  return {
    componentStatesByInstanceKey: {} as Record<string, ProcessFlowComponentState>,
    componentErrorsByInstanceKey: {} as Record<string, string>,
    staleComponentInstanceKeys: [] as string[]
  };
};

export const useProcessFlowState = (processId?: string, options?: UseProcessFlowStateOptions) => {
  const { findProcessById } = useProcesses();
  const { findFlowModelById } = useFlowModels();

  const resolveComponentData = options?.resolveComponentData ?? true;

  return useQuery({
    queryKey: ['processFlowState', processId, resolveComponentData],
    enabled: !!processId,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<ProcessFlowState> => {
      if (!processId) {
        throw new Error('ID do processo não informado para carregar o fluxo.');
      }

      const process = await findProcessById(processId);
      const processRecord: UnknownRecord = isRecord(process) ? process : {};
      const normalizedProcessId = process._id || processId;

      const flowModelId = extractFlowModelId(process, processRecord);
      if (!flowModelId) {
        throw new Error('Processo sem workflowModelId para montar as etapas do fluxo.');
      }

      const [flowModel, flowInstanceRecord] = await Promise.all([
        findFlowModelById(flowModelId),
        fetchFlowInstanceByProcess(normalizedProcessId)
      ]);

      const processInstanceId = extractProcessInstanceId({
        processRecord,
        flowInstanceRecord,
        processId: normalizedProcessId
      });

      const snapshot = extractSnapshotMeta({
        processRecord,
        flowInstanceRecord,
        processInstanceId
      });

      const stageSourcesFromSnapshot = extractSnapshotStages(flowInstanceRecord);
      const stageSources =
        stageSourcesFromSnapshot.length > 0
          ? stageSourcesFromSnapshot
          : toStageSourcesFromFlowModel(flowModel.stages || []);

      const stageExecutions = extractStageExecutions(flowInstanceRecord);
      const executionStatusByStageId = buildExecutionStatusByStageId(stageExecutions);
      const stageInstancesByStageId = buildStageInstancesByStageId({
        stageSources,
        processInstanceId
      });

      const stages = toStageCards({
        process,
        processId: normalizedProcessId,
        stageSources,
        processInstanceId,
        stageInstancesByStageId,
        executionStatusByStageId
      });

      if (!resolveComponentData) {
        const emptyMaps = createEmptyComponentMaps();

        return {
          process,
          flowModelId,
          snapshot,
          stages,
          stageInstancesByStageId,
          ...emptyMaps
        };
      }

      const componentTargets = stages.flatMap((stage) => {
        return stage.components.map((component) => ({ stage, component }));
      });

      const componentResults = await Promise.all(
        componentTargets.map((target) => {
          return fetchComponentState({
            processId: normalizedProcessId,
            processInstanceId,
            snapshotVersion: snapshot.snapshotVersion,
            stage: target.stage,
            component: target.component
          });
        })
      );

      const normalized = createEmptyComponentMaps();

      for (const result of componentResults) {
        if (result.state) {
          normalized.componentStatesByInstanceKey[result.componentInstanceKey] = result.state;
        }

        if (result.error) {
          normalized.componentErrorsByInstanceKey[result.componentInstanceKey] = result.error;
        }

        if (result.stale && !normalized.staleComponentInstanceKeys.includes(result.componentInstanceKey)) {
          normalized.staleComponentInstanceKeys.push(result.componentInstanceKey);
        }
      }

      return {
        process,
        flowModelId,
        snapshot,
        stages,
        stageInstancesByStageId,
        ...normalized
      };
    }
  });
};
