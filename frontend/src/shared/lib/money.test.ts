import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyInput } from './money';

describe('money', () => {
  it('formatea montos con decimales', () => {
    expect(formatMoney(1234567, { symbol: '€', minorUnits: 2 })).toBe('€ 12.345,67');
  });

  it('formatea montos sin decimales (COP)', () => {
    expect(formatMoney(50000, { symbol: '$', minorUnits: 0 })).toBe('$ 50.000');
  });

  it('formatea la entrada de importes con separadores de miles y decimales', () => {
    expect(formatMoneyInput('2400000', 2)).toBe('24.000,00');
    expect(formatMoneyInput('2400000', 0)).toBe('2.400.000');
    expect(formatMoneyInput('5', 2)).toBe('0,05');
    expect(formatMoneyInput('', 2)).toBe('');
  });
});
