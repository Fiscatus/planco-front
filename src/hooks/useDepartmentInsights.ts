import { useQuery } from '@tanstack/react-query';
import type { InsightsParams } from '@/globals/types';
import { insightsService } from '@/services/insightsService';

export const useDepartmentInsights = (
  departmentId: string | undefined,
  params?: Pick<InsightsParams, 'dateFrom' | 'dateTo'>
) =>
  useQuery({
    queryKey: ['insights-department', departmentId, params],
    queryFn: () => insightsService.getDepartmentInsights(departmentId!, params),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000
  });
