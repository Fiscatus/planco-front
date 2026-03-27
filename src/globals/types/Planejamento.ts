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
  alertType: 'vencido' | 'assinatura' | 'juridico' | 'outro';
  description: string;
};

export type ProcessoRecente = {
  processId: string;
  processNumber: string;
  object: string;
  currentStage: string;
  status: 'em_dia' | 'atrasado' | 'prazo';
  daysLate: number;
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

export type PlanejamentoDashboardResponse = {
  kpis: PlanejamentoKpis;
  alertasCriticos: AlertaCritico[];
  processosRecentes: ProcessoRecente[];
  pendencias: Pendencia[];
  proximosPrazos: ProximoPrazo[];
};
