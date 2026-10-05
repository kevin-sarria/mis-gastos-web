import { describe, expect, it } from 'vitest';
import {
  detectCuttableExpenses,
  generateInsights,
} from '../src/modules/insights/insights.engine';

describe('generateInsights', () => {
  it('detecta gasto superior al ingreso', () => {
    const insights = generateInsights({
      totalIncome: 1000,
      totalExpenses: 1200,
      antExpenseTotal: 0,
      currentExpenses: 1200,
      previousExpenses: 0,
      monthsTracked: 1,
    });

    expect(insights.some((i) => i.title === 'Gastas más de lo que ingresas')).toBe(true);
  });

  it('reconoce un hábito de ahorro saludable', () => {
    const insights = generateInsights({
      totalIncome: 1000,
      totalExpenses: 700,
      antExpenseTotal: 0,
      currentExpenses: 700,
      previousExpenses: 0,
      monthsTracked: 1,
    });

    expect(insights.some((i) => i.type === 'SUCCESS')).toBe(true);
  });

  it('detecta gasto anómalo mes a mes', () => {
    const insights = generateInsights({
      totalIncome: 1000,
      totalExpenses: 500,
      antExpenseTotal: 0,
      currentExpenses: 500,
      previousExpenses: 400,
      monthsTracked: 2,
    });

    expect(insights.some((i) => i.title === 'Gasto anómalo detectado')).toBe(true);
  });
});

describe('detectCuttableExpenses', () => {
  it('marca gastos hormiga y deja lo esencial', () => {
    const result = detectCuttableExpenses([
      { title: 'Café', categoryName: 'Ocio', tags: ['ANT_EXPENSE'], amountMinorUnits: 500 },
      { title: 'Alquiler', categoryName: 'Vivienda', tags: ['FIXED'], amountMinorUnits: 100000 },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Café');
  });
});
