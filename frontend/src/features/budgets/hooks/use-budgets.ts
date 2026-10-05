import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpBudgetApi } from '../api/budget-api';
import type { BudgetCreateInput } from '../domain/budget';

export function useBudgets() {
  return useQuery({ queryKey: ['budgets'], queryFn: () => httpBudgetApi.list() });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetCreateInput) => httpBudgetApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpBudgetApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });
}
