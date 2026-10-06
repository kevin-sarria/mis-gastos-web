import { describe, expect, it } from 'vitest';
import {
  formatMonthKey,
  groupByCategory,
  isWithinRange,
  monthRange,
  parseMonthKey,
  previousMonthOf,
  sumAmounts,
} from '../src/shared/utils/finance';

describe('finance utils', () => {
  it('suma montos en unidades menores', () => {
    expect(sumAmounts([{ amountMinorUnits: 100 }, { amountMinorUnits: 250 }])).toBe(350);
  });

  it('determina si una fecha pertenece al mes seleccionado', () => {
    const range = monthRange(2026, 3); // marzo 2026

    expect(isWithinRange(new Date(2026, 2, 1), range)).toBe(true);
    expect(isWithinRange(new Date(2026, 2, 31), range)).toBe(true);
    expect(isWithinRange(new Date(2026, 3, 1), range)).toBe(false); // abril
    expect(isWithinRange(new Date(2026, 1, 28), range)).toBe(false); // febrero
  });

  it('interpreta la clave de mes y cae al mes actual si es inválida', () => {
    expect(formatMonthKey(parseMonthKey('2026-03'))).toBe('2026-03');
    expect(formatMonthKey(parseMonthKey('invalido', new Date(2026, 4, 10)))).toBe('2026-05');
  });

  it('calcula el mes anterior incluso al cruzar el año', () => {
    expect(formatMonthKey(previousMonthOf(monthRange(2026, 1)))).toBe('2025-12');
    expect(formatMonthKey(previousMonthOf(monthRange(2026, 10)))).toBe('2026-09');
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
