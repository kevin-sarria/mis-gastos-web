export type BudgetPeriod = 'MONTHLY' | 'WEEKLY';

export interface Budget {
  id: string;
  categoryId: string | null;
  name: string;
  amountMinorUnits: number;
  period: BudgetPeriod;
  alertThresholdPct: number;
  isActive: boolean;
  category: { id: string; name: string; color: string | null } | null;
}

export interface BudgetCreateInput {
  categoryId: string | null;
  name: string;
  amountMinorUnits: number;
  period: BudgetPeriod;
  alertThresholdPct: number;
}
