import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelectedMonth } from '@/shared/hooks/use-selected-month';
import { httpExpenseApi } from '../api/expense-api';
import type { ExpenseCreateInput } from '../domain/expense';

export function useExpenses() {
  const { month } = useSelectedMonth();
  return useQuery({
    queryKey: ['expenses', month],
    queryFn: () => httpExpenseApi.list(month),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseCreateInput) => httpExpenseApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpExpenseApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
