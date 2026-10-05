import { useQuery } from '@tanstack/react-query';
import { httpInsightsApi } from '../api/insights-api';

export function useInsights() {
  return useQuery({ queryKey: ['insights'], queryFn: () => httpInsightsApi.get() });
}
