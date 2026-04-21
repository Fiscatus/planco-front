export type Process = {
  _id: string;
  processInstanceId?: string;
  flowInstance?: string | { _id: string };
  processNumber: string;
  object: string;
  workflowModel?: string | { _id: string };
  workflowModelId?: string;
  flowModelId?: string;
  currentStage?: string;
  currentStageId?: string;
  snapshotVersion?: string | number;
  modality?: string;
  priority?: 'Baixa' | 'Média' | 'Alta';
  status?: 'Em Andamento' | 'Em Atraso' | 'Concluído' | 'Pendente';
  dueDate?: string;
  estimatedValue?: number;
  folder?:
    | string
    | {
        _id: string;
        name: string;
        year?: string;
      };
  org?: string;
  createdAt?: string;
  updatedAt?: string;
  topPendencia?: {
    type: string | null;
    label: string;
  };
};

export type PaginatedProcesses = {
  items: Process[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FilterProcessesDto = {
  page?: number;
  limit?: number;
  departmentId?: string;
  processNumber?: string;
  object?: string;
  currentStage?: string;
  status?: string;
  priority?: string;
  modality?: string;
};

export type CreateProcessDto = {
  processNumber: string;
  object: string;
  workflowModelId?: string;
  modality?: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  folderId: string;
  dueDate: string;
  estimatedValue?: number;
  creatorDepartment: string;
  participatingDepartments?: string[];
};

export type UpdateProcessDto = {
  processNumber?: string;
  object?: string;
  dueDate?: string;
  priority?: 'Baixa' | 'Média' | 'Alta';
  modality?: string;
  estimatedValue?: number;
  situation?: string;
  folderId?: string;
  participatingDepartments?: string[];
  managers?: string[];
};

export type FolderStatsDto = {
  totalProcessos: number;
  processosAndamento: number;
  processosAtraso: number;
  processosConcluidos: number;
  ultimaModificacao: string;
  dataCriacao: string;
};
