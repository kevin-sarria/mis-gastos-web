import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpDebtApi } from '../api/debt-api';
import type { PaymentInput, SimulatorInput } from '../api/debt-api';
import type { DebtCreateInput } from '../domain/debt';

const KEY = ['debts'];

export function useDebts() {
  return useQuery({ queryKey: KEY, queryFn: () => httpDebtApi.list() });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: KEY });
}

export function useCreateDebt() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: DebtCreateInput) => httpDebtApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateDebt() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DebtCreateInput> }) =>
      httpDebtApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteDebt() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => httpDebtApi.remove(id), onSuccess: invalidate });
}

export function useAddPayment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentInput }) =>
      httpDebtApi.addPayment(id, input),
    onSuccess: invalidate,
  });
}

export function useSimulateDebt() {
  return useMutation({ mutationFn: (input: SimulatorInput) => httpDebtApi.simulate(input) });
}

export function usePayoffPlan(extraMinorUnits: number) {
  return useQuery({
    queryKey: [...KEY, 'payoff-plan', extraMinorUnits],
    queryFn: () => httpDebtApi.payoffPlan(extraMinorUnits),
  });
}
