import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelectedMonth } from '@/shared/hooks/use-selected-month';
import { httpBudgetApi } from '../api/budget-api';
import type { BudgetCreateInput } from '../domain/budget';

export function useBudgets() {
  const { month } = useSelectedMonth();
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => httpBudgetApi.list(month),
  });
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
