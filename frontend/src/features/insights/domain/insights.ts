export type InsightType = 'WARNING' | 'OPPORTUNITY' | 'SUCCESS';

export type InsightCode =
  | 'SPENT_MORE_THAN_EARNED'
  | 'SAVINGS_MARGIN'
  | 'TIGHT_MARGIN'
  | 'EXPENSES_UP'
  | 'ANT_EXPENSES'
  | 'TOP_CATEGORY'
  | 'NO_COMPARISON';

export type InsightParams = Record<string, string | number>;

export interface Insight {
  type: InsightType;
  code: InsightCode;
  params: InsightParams;
}

export type CuttableReasonCode = 'ANT_EXPENSE' | 'NON_ESSENTIAL';

export interface CuttableExpense {
  title: string;
  categoryName: string;
  amountMinorUnits: number;
  reasonCode: CuttableReasonCode;
}

export interface InsightsData {
  month: string;
  insights: Insight[];
  cuttableExpenses: CuttableExpense[];
}
