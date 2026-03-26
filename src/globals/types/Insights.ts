export type CriticalAlert = {
  processId: string;
  processNumber: string;
  object: string;
  status: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  dueDate: string;
  createdAt: string;
  daysOverdue: number;
};

export type ProcessKpi = {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byModality: Record<string, number>;
  overdue: number;
  dueSoon: number;
  criticalAlerts: CriticalAlert[];
};

export type DepartmentSummary = {
  departmentId: string;
  name: string;
  acronym: string;
  total: number;
  overdue: number;
  concluded: number;
  inProgress: number;
};

export type PaginatedDepartmentInsights = {
  data: DepartmentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MonthCount = {
  month: string;
  count: number;
};

export type InsightsParams = {
  search?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type InsightsResponse = {
  processes: ProcessKpi;
  byDepartment: PaginatedDepartmentInsights;
  users: { total: number; active: number; inactive: number; unverified: number };
  approvals: { pending: number; approved: number; rejected: number };
  processesPerMonth: MonthCount[];
  generatedAt: string;
};

export type DepartmentInsightsResponse = {
  departmentId: string;
  name: string;
  acronym: string;
  processes: ProcessKpi;
  approvals: { pending: number; approved: number; rejected: number };
  processesPerMonth: MonthCount[];
  generatedAt: string;
};
