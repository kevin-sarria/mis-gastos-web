import { useQuery } from '@tanstack/react-query';
import { httpDashboardApi } from '../api/dashboard-api';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => httpDashboardApi.summary() });
}
