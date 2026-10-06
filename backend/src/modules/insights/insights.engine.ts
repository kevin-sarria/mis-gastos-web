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

export interface InsightMetrics {
  totalIncome: number;
  totalExpenses: number;
  antExpenseTotal: number;
  currentExpenses: number;
  previousExpenses: number;
  topCategory?: { name: string; total: number };
  monthsTracked: number;
}

export function generateInsights(metrics: InsightMetrics): Insight[] {
  const insights: Insight[] = [];

  if (metrics.totalIncome > 0) {
    if (metrics.totalExpenses > metrics.totalIncome) {
      insights.push({ type: 'WARNING', code: 'SPENT_MORE_THAN_EARNED', params: {} });
    } else {
      const savingsRate = (metrics.totalIncome - metrics.totalExpenses) / metrics.totalIncome;
      if (savingsRate >= 0.2) {
        insights.push({
          type: 'SUCCESS',
          code: 'SAVINGS_MARGIN',
          params: { percent: Math.round(savingsRate * 100) },
        });
      } else if (savingsRate < 0.05) {
        insights.push({ type: 'WARNING', code: 'TIGHT_MARGIN', params: {} });
      }
    }
  }

  if (metrics.previousExpenses > 0 && metrics.currentExpenses > metrics.previousExpenses * 1.2) {
    insights.push({ type: 'WARNING', code: 'EXPENSES_UP', params: {} });
  }

  if (metrics.antExpenseTotal > 0) {
    insights.push({ type: 'OPPORTUNITY', code: 'ANT_EXPENSES', params: {} });
  }

  if (metrics.topCategory && metrics.topCategory.total > 0) {
    insights.push({
      type: 'OPPORTUNITY',
      code: 'TOP_CATEGORY',
      params: { category: metrics.topCategory.name },
    });
  }

  if (metrics.monthsTracked === 1) {
    insights.push({ type: 'SUCCESS', code: 'NO_COMPARISON', params: {} });
  }

  return insights.slice(0, 5);
}

export type CuttableReasonCode = 'ANT_EXPENSE' | 'NON_ESSENTIAL';

export interface CuttableExpense {
  title: string;
  categoryName: string;
  amountMinorUnits: number;
  reasonCode: CuttableReasonCode;
}

const NON_ESSENTIAL_CATEGORIES = new Set([
  'ocio',
  'entretenimiento',
  'restaurantes',
  'compras',
  'viajes',
  'otros gastos',
]);

export function detectCuttableExpenses(
  expenses: { title: string; categoryName: string; tags: string[]; amountMinorUnits: number }[],
): CuttableExpense[] {
  return expenses
    .filter(
      (expense) =>
        expense.tags.includes('ANT_EXPENSE') ||
        NON_ESSENTIAL_CATEGORIES.has(expense.categoryName.toLowerCase()),
    )
    .map((expense) => ({
      title: expense.title,
      categoryName: expense.categoryName,
      amountMinorUnits: expense.amountMinorUnits,
      reasonCode: expense.tags.includes('ANT_EXPENSE')
        ? ('ANT_EXPENSE' as const)
        : ('NON_ESSENTIAL' as const),
    }));
}
