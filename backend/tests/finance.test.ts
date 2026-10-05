import { describe, expect, it } from 'vitest';
import {
  groupByCategory,
  isRecurringIncomeActiveInMonth,
  monthRange,
  sumAmounts,
} from '../src/shared/utils/finance';

describe('finance utils', () => {
  it('suma montos en unidades menores', () => {
    expect(sumAmounts([{ amountMinorUnits: 100 }, { amountMinorUnits: 250 }])).toBe(350);
  });

  it('detecta ingresos recurrentes activos en el mes', () => {
    const range = monthRange(2026, 3); // marzo 2026

    expect(isRecurringIncomeActiveInMonth('MONTHLY', new Date(2026, 1, 15), range)).toBe(true);
    expect(isRecurringIncomeActiveInMonth('ONE_TIME', new Date(2026, 2, 10), range)).toBe(true);
    expect(isRecurringIncomeActiveInMonth('ONE_TIME', new Date(2026, 1, 10), range)).toBe(false);
    expect(isRecurringIncomeActiveInMonth('YEARLY', new Date(2026, 2, 5), range)).toBe(true);
    expect(isRecurringIncomeActiveInMonth('YEARLY', new Date(2026, 3, 5), range)).toBe(false);
  });

  it('agrupa gastos por categoría ordenados de mayor a menor', () => {
    const result = groupByCategory([
      { categoryId: 'a', categoryName: 'Ocio', amountMinorUnits: 100 },
      { categoryId: 'b', categoryName: 'Vivienda', amountMinorUnits: 500 },
      { categoryId: 'a', categoryName: 'Ocio', amountMinorUnits: 150 },
    ]);

    expect(result[0]?.name).toBe('Vivienda');
    expect(result[1]?.name).toBe('Ocio');
    expect(result[1]?.total).toBe(250);
  });
});
