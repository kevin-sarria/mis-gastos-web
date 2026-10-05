import { describe, expect, it } from 'vitest';
import { formatMoney, parseAmountToMinorUnits } from './money';

describe('money', () => {
  it('formatea montos con decimales', () => {
    expect(formatMoney(1234567, { symbol: '€', minorUnits: 2 })).toBe('€ 12.345,67');
  });

  it('formatea montos sin decimales (COP)', () => {
    expect(formatMoney(50000, { symbol: '$', minorUnits: 0 })).toBe('$ 50.000');
  });

  it('convierte texto a unidades menores', () => {
    expect(parseAmountToMinorUnits('1234,56', 2)).toBe(123456);
    expect(parseAmountToMinorUnits('50', 0)).toBe(50);
  });
});
