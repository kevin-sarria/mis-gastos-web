import { useQuery } from '@tanstack/react-query';
import { useSelectedMonth } from '@/shared/hooks/use-selected-month';
import { httpInsightsApi } from '../api/insights-api';

export function useInsights() {
  const { month } = useSelectedMonth();
  return useQuery({
    queryKey: ['insights', month],
    queryFn: () => httpInsightsApi.get(month),
  });
}
