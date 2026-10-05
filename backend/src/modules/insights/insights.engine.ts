export type InsightType = 'WARNING' | 'OPPORTUNITY' | 'SUCCESS';

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
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
      insights.push({
        type: 'WARNING',
        title: 'Gastas más de lo que ingresas',
        description: 'Este mes tus gastos superan tus ingresos. Revisa los gastos variables y hormiga.',
      });
    } else {
      const savingsRate = (metrics.totalIncome - metrics.totalExpenses) / metrics.totalIncome;
      if (savingsRate >= 0.2) {
        insights.push({
          type: 'SUCCESS',
          title: 'Buen hábito de ahorro',
          description: `Estás ahorrando cerca del ${Math.round(savingsRate * 100)}% de tus ingresos.`,
        });
      } else if (savingsRate < 0.05) {
        insights.push({
          type: 'WARNING',
          title: 'Margen de ahorro bajo',
          description: 'Te queda poco margen al final del mes. Intenta recortar lo no esencial.',
        });
      }
    }
  }

  if (metrics.previousExpenses > 0 && metrics.currentExpenses > metrics.previousExpenses * 1.2) {
    insights.push({
      type: 'WARNING',
      title: 'Gasto anómalo detectado',
      description: 'Tus gastos subieron más de un 20% frente al mes anterior.',
    });
  }

  if (metrics.antExpenseTotal > 0) {
    insights.push({
      type: 'OPPORTUNITY',
      title: 'Gastos hormiga',
      description: 'Tienes gastos hormiga que podrías reducir sin afectar lo esencial.',
    });
  }

  if (metrics.topCategory && metrics.topCategory.total > 0) {
    insights.push({
      type: 'OPPORTUNITY',
      title: `Tu mayor gasto: ${metrics.topCategory.name}`,
      description: 'Revisa si puedes recortar en esta categoría.',
    });
  }

  if (metrics.monthsTracked === 1) {
    insights.push({
      type: 'SUCCESS',
      title: 'Primer mes registrado',
      description: 'Con más meses podrás ver tendencias y comparativas.',
    });
  }

  return insights.slice(0, 5);
}

export interface CuttableExpense {
  title: string;
  categoryName: string;
  amountMinorUnits: number;
  reason: string;
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
      reason: expense.tags.includes('ANT_EXPENSE') ? 'Gasto hormiga' : 'Categoría no esencial',
    }));
}
