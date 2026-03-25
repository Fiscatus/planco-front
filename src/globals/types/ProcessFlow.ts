import type { Process } from './Process';

export type ProcessComponentType =
  | 'SIGNATURE'
  | 'COMMENTS'
  | 'FORM'
  | 'APPROVAL'
  | 'FILES_MANAGEMENT'
  | 'TIMELINE'
  | 'CHECKLIST'
  | 'STAGE_PANEL';

export type ProcessStageStatus = 'completed' | 'in_progress' | 'pending';

export type ProcessFlowComponentDescriptor = {
  componentKey: string;
  componentType: ProcessComponentType;
  label: string;
  required: boolean;
};

export type ProcessFlowStageCard = {
  id: string;
  order: number;
  stageId: string;
  stageInstanceId: string;
  title: string;
  department: string;
  status: ProcessStageStatus;
  additionalInfo?: string;
  wasAdvanced?: boolean;
  components: ProcessFlowComponentDescriptor[];
};

export type ProcessFlowComponentState = {
  processId: string;
  processInstanceId: string;
  stageId: string;
  stageInstanceId: string;
  componentKey: string;
  componentType: ProcessComponentType;
  endpoint: string;
  snapshotVersion?: string | number;
  fetchedAt: string;
  data: unknown;
};

export type ProcessFlowSnapshotMeta = {
  processInstanceId: string;
  snapshotVersion?: string | number;
  etag?: string;
  sourceEndpoint?: string;
};

export type ProcessFlowState = {
  process: Process;
  flowModelId: string;
  snapshot: ProcessFlowSnapshotMeta;
  stages: ProcessFlowStageCard[];
  stageInstancesByStageId: Record<string, string>;
  componentStatesByInstanceKey: Record<string, ProcessFlowComponentState>;
  componentErrorsByInstanceKey: Record<string, string>;
  staleComponentInstanceKeys: string[];
};
