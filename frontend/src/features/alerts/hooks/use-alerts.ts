import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpAlertApi } from '../api/alert-api';

export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: () => httpAlertApi.list() });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpAlertApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
