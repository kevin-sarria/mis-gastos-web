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
        title: 'Gastaste más de lo que ingresaste',
        description: 'Este mes los gastos superan a los ingresos registrados.',
      });
    } else {
      const savingsRate = (metrics.totalIncome - metrics.totalExpenses) / metrics.totalIncome;
      if (savingsRate >= 0.2) {
        insights.push({
          type: 'SUCCESS',
          title: `Margen de ahorro del ${Math.round(savingsRate * 100)}%`,
          description: 'Te quedó sin gastar cerca de ese porcentaje de tus ingresos.',
        });
      } else if (savingsRate < 0.05) {
        insights.push({
          type: 'WARNING',
          title: 'Margen ajustado',
          description: 'Te quedó sin gastar menos del 5% de tus ingresos.',
        });
      }
    }
  }

  if (metrics.previousExpenses > 0 && metrics.currentExpenses > metrics.previousExpenses * 1.2) {
    insights.push({
      type: 'WARNING',
      title: 'Subida respecto al mes anterior',
      description: 'Los gastos subieron más de un 20% frente al mes anterior.',
    });
  }

  if (metrics.antExpenseTotal > 0) {
    insights.push({
      type: 'OPPORTUNITY',
      title: 'Gastos hormiga registrados',
      description: 'Son pequeños, pero si se repiten acaban pesando en el mes.',
    });
  }

  if (metrics.topCategory && metrics.topCategory.total > 0) {
    insights.push({
      type: 'OPPORTUNITY',
      title: `Tu mayor categoría: ${metrics.topCategory.name}`,
      description: 'Es donde más se concentró tu gasto del mes.',
    });
  }

  if (metrics.monthsTracked === 1) {
    insights.push({
      type: 'SUCCESS',
      title: 'Sin comparación todavía',
      description: 'Con más de un mes registrado podrás comparar mes a mes.',
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
      reason: expense.tags.includes('ANT_EXPENSE') ? 'Gasto hormiga' : 'No esencial',
    }));
}
