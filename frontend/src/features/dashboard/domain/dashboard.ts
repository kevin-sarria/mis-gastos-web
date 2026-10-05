export interface TopCategory {
  categoryId: string;
  name: string;
  total: number;
}

export interface DashboardSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topCategories: TopCategory[];
  activeAlerts: number;
  trends: {
    income: number | null;
    expenses: number | null;
  };
}
