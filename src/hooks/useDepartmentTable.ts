import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { InsightsParams, PaginatedDepartmentInsights } from '@/globals/types';
import { api } from '@/services';

export const useDepartmentTable = (params?: Pick<InsightsParams, 'search' | 'page' | 'limit'>) => {
  const fetchDepartmentTable = useCallback(async () => {
    const response = await api.get<PaginatedDepartmentInsights>('/insights/departments', { params });
    return response.data;
  }, [params?.search, params?.page, params?.limit]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: ['insights-departments', params],
    queryFn: fetchDepartmentTable,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev
  });
};
