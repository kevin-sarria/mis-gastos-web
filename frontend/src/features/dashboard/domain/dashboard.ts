export interface TopCategory {
  categoryId: string;
  name: string;
  total: number;
}

export interface DashboardDebts {
  hasPlan: boolean;
  paymentsMinorUnits: number;
  paidMinorUnits: number;
  remainingMinorUnits: number;
  totalBalanceMinorUnits: number;
  monthsToFreedom: number | null;
  /** Ingresos - gastos - deudas: lo que te queda de verdad. */
  afterDebtsMinorUnits: number;
}

export interface DashboardSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topCategories: TopCategory[];
  activeAlerts: number;
  isCurrentMonth: boolean;
  debts: DashboardDebts;
  trends: {
    income: number | null;
    expenses: number | null;
  };
}
