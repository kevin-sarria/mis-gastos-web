export type InsightType = 'WARNING' | 'OPPORTUNITY' | 'SUCCESS';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
}

export interface CuttableExpense {
  title: string;
  categoryName: string;
  amountMinorUnits: number;
  reason: string;
}

export interface InsightsData {
  month: string;
  insights: Insight[];
  cuttableExpenses: CuttableExpense[];
}
