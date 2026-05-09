import { useQuery } from '@tanstack/react-query';
import type { PlanejamentoDashboardResponse } from '@/globals/types';
import { api } from '@/services';

type Params = {
  departmentId?: string;
  alertasPage?: number;
  alertasLimit?: number;
  recentesPage?: number;
  recentesLimit?: number;
};

export const usePlanejamentoDashboard = ({
  departmentId,
  alertasPage = 1,
  alertasLimit = 5,
  recentesPage = 1,
  recentesLimit = 5,
}: Params = {}) => {
  return useQuery({
    queryKey: ['planejamento-dashboard', departmentId, alertasPage, alertasLimit, recentesPage, recentesLimit],
    queryFn: async () => {
      const response = await api.get<PlanejamentoDashboardResponse>('/planejamento/dashboard', {
        params: {
          ...(departmentId ? { departmentId } : {}),
          alertasPage,
          alertasLimit,
          recentesPage,
          recentesLimit,
        },
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};
