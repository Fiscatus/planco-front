import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PlanejamentoDashboardResponse } from '@/globals/types';
import { api } from '@/services';

export const usePlanejamentoDashboard = (departmentId?: string) => {
  const fetchDashboard = useCallback(async () => {
    const response = await api.get<PlanejamentoDashboardResponse>('/planejamento/dashboard', {
      params: departmentId ? { departmentId } : undefined
    });
    return response.data;
  }, [departmentId]);

  return useQuery({
    queryKey: ['planejamento-dashboard', departmentId],
    queryFn: fetchDashboard,
    staleTime: 2 * 60 * 1000,
    enabled: true
  });
};
