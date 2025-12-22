export type Process = {
  _id: string;
  processNumber: string;
  object: string;
  currentStage?: string;
  modality?: string;
  priority?: 'Baixa' | 'Média' | 'Alta';
  status?: 'Em Andamento' | 'Em Atraso' | 'Concluído' | 'Pendente';
  dueDate?: string;
  estimatedValue?: number;
  folder?: string | {
    _id: string;
    name: string;
    year?: string;
  };
  org?: string;
  createdAt?: string;
  updatedAt?: string;
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
  dueDate?: string;
  priority?: 'Baixa' | 'Média' | 'Alta';
  modality?: string;
  participatingDepartments?: string[];
};

export type FolderStatsDto = {
  totalProcessos: number;
  processosAndamento: number;
  processosAtraso: number;
  processosConcluidos: number;
  ultimaModificacao: string;
  dataCriacao: string;
};

