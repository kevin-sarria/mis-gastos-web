import { useQuery } from '@tanstack/react-query';
import { useSelectedMonth } from '@/shared/hooks/use-selected-month';
import { httpDashboardApi } from '../api/dashboard-api';

export function useDashboard() {
  const { month } = useSelectedMonth();
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => httpDashboardApi.summary(month),
  });
}
