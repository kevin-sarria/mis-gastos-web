import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PayoffStrategy } from '../domain/plan';
import { httpDebtApi } from '../api/debt-api';

export interface MonthlyPlanItem {
  debtId: string;
  name: string;
  plannedMinorUnits: number;
  paidMinorUnits: number;
  isPaid: boolean;
}

export interface MonthlyPlan {
  strategy: PayoffStrategy;
  extraMonthlyMinorUnits: number;
  startedAt: string;
  items: MonthlyPlanItem[];
  plannedTotalMinorUnits: number;
  paidTotalMinorUnits: number;
  monthsToFreedom: number;
  totalInterestMinorUnits: number;
  totalBalanceMinorUnits: number;
}

const PLAN_KEY = ['debts', 'plan'];

export function useDebtPlan() {
  return useQuery({ queryKey: PLAN_KEY, queryFn: () => httpDebtApi.getPlan() });
}

export function useSaveDebtPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { strategy: PayoffStrategy; extraMonthlyMinorUnits: number }) =>
      httpDebtApi.savePlan(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });
}

export function useDeleteDebtPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => httpDebtApi.removePlan(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['debts'] }),
  });
}
