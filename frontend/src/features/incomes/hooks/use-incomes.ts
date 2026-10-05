import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpIncomeApi } from '../api/income-api';
import type { IncomeCreateInput } from '../domain/income';

export function useIncomes() {
  return useQuery({ queryKey: ['incomes'], queryFn: () => httpIncomeApi.list() });
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
