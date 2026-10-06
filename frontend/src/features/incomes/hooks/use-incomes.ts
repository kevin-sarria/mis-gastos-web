import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelectedMonth } from '@/shared/hooks/use-selected-month';
import { httpIncomeApi } from '../api/income-api';
import type { IncomeCreateInput } from '../domain/income';

export function useIncomes() {
  const { month } = useSelectedMonth();
  return useQuery({
    queryKey: ['incomes', month],
    queryFn: () => httpIncomeApi.list(month),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IncomeCreateInput) => httpIncomeApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] }),
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpIncomeApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] }),
  });
}
