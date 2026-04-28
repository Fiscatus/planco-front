export type PlanejamentoKpis = {
  emAndamento: number;
  emAndamentoEstaSemana: number;
  prazosCriticos: number;
  concluidosMes: number;
  concluidosMeta: number;
  aguardandoAprovacao: number;
  aguardandoRevisao: number;
};

export type AlertaCritico = {
  processId: string;
  processNumber: string;
  object: string;
  alertType: 'vencido' | 'etapa_atrasada' | 'assinatura' | 'juridico' | 'outro';
  description: string;
  stageName?: string;
  stageDueDate?: string;
};

export type ProcessoRecente = {
  processId: string;
  processNumber: string;
  object: string;
  currentStage: string;
  stageStatus: 'em_dia' | 'atrasada' | 'vence_hoje' | 'concluida';
  processStatus: 'em_andamento' | 'em_risco' | 'atrasado' | 'finalizado' | 'paralisado';
  dueDate: string;
};

export type Pendencia = {
  pendenciaId: string;
  processId?: string;
  title: string;
  type: 'tarefa' | 'assinatura' | 'validacao' | 'timeline' | 'outro';
  urgency: 'critico' | 'prioritario' | 'aguardando' | 'normal';
  detail: string;
  date?: string;
};

export type ProximoPrazo = {
  prazoId: string;
  processId?: string;
  processNumber?: string;
  title: string;
  description: string;
  date: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PlanejamentoDashboardResponse = {
  kpis: PlanejamentoKpis;
  alertasCriticos: Paginated<AlertaCritico>;
  processosRecentes: Paginated<ProcessoRecente>;
  pendencias: Pendencia[];
  proximosPrazos: ProximoPrazo[];
};
