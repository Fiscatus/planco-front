import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DepartmentInsightsResponse, InsightsParams } from '@/globals/types';
import { api } from '@/services';

export const useDepartmentInsights = (
  departmentId: string | undefined,
  params?: Pick<InsightsParams, 'dateFrom' | 'dateTo'>
) => {
  const fetchDepartmentInsights = useCallback(async () => {
    const response = await api.get<DepartmentInsightsResponse>(
      `/insights/department/${departmentId}`,
      { params }
    );
    return response.data;
  }, [departmentId, params?.dateFrom, params?.dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: ['insights-department', departmentId, params],
    queryFn: fetchDepartmentInsights,
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000
  });
};
