import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { InsightsParams, InsightsResponse } from '@/globals/types';
import { api } from '@/services';

export const useInsights = (params?: Pick<InsightsParams, 'dateFrom' | 'dateTo'>) => {
  const fetchInsights = useCallback(async () => {
    const response = await api.get<InsightsResponse>('/insights', { params });
    return response.data;
  }, [params?.dateFrom, params?.dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: ['insights', params],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000
  });
};
