import type { DepartmentInsightsResponse, InsightsParams, InsightsResponse } from '@/globals/types';
import { api } from './api';

export const insightsService = {
  getInsights: (params?: InsightsParams) =>
    api.get<InsightsResponse>('/insights', { params }).then((r) => r.data),

  getDepartmentInsights: (id: string, params?: Pick<InsightsParams, 'dateFrom' | 'dateTo'>) =>
    api.get<DepartmentInsightsResponse>(`/insights/department/${id}`, { params }).then((r) => r.data)
};
