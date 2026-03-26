import { useQuery } from '@tanstack/react-query';
import type { InsightsParams } from '@/globals/types';
import { insightsService } from '@/services/insightsService';

export const useInsights = (params?: InsightsParams) =>
  useQuery({
    queryKey: ['insights', params],
    queryFn: () => insightsService.getInsights(params),
    staleTime: 5 * 60 * 1000
  });
