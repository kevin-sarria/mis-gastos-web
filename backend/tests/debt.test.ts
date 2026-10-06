import { describe, expect, it } from 'vitest';
import {
  buildSchedule,
  monthlyPayment,
  monthsToPayoff,
  simulateByTerm,
  simulatePayoff,
  teaFromTem,
  weightedAverageRate,
  type PayoffDebtInput,
} from '../src/shared/utils/debt';

describe('motor de deudas', () => {
  it('calcula la cuota fija del sistema francés', () => {
    // 1.000.000 al 2% mensual en 12 meses -> ~94.560
    const payment = monthlyPayment(1_000_000, 20_000, 12);
    expect(Math.abs(payment - 94_560)).toBeLessThanOrEqual(1);
  });

  it('sin interés reparte el capital en partes iguales', () => {
    const result = simulateByTerm(1_200_000, 0, 12);
    expect(result.monthlyPaymentMinorUnits).toBe(100_000);
    expect(result.totalInterestMinorUnits).toBe(0);
    expect(result.totalPaidMinorUnits).toBe(1_200_000);
    expect(result.months).toBe(12);
  });

  it('la tabla liquida exactamente el capital y no deja saldo', () => {
    const result = simulateByTerm(2_500_000, 25_000, 24);
    const principal = result.schedule.reduce((sum, row) => sum + row.principalMinorUnits, 0);
    expect(principal).toBe(2_500_000);
    expect(result.schedule[result.schedule.length - 1]?.balanceMinorUnits).toBe(0);
  });

  it('los intereses totales son coherentes con lo pagado', () => {
    const result = simulateByTerm(2_500_000, 25_000, 24);
    expect(result.totalPaidMinorUnits).toBe(2_500_000 + result.totalInterestMinorUnits);
  });

  it('convierte TEM en TEA', () => {
    // 2% mensual -> 26,82% anual
    expect(Math.abs(teaFromTem(20_000) - 268_242)).toBeLessThanOrEqual(10);
  });

  it('calcula los meses que faltan con una cuota dada', () => {
    const payment = monthlyPayment(1_000_000, 20_000, 12);
    expect(monthsToPayoff(1_000_000, 20_000, payment)).toBe(12);
  });

  it('detecta cuando la cuota no cubre ni los intereses', () => {
    // 2.000.000 al 5% genera 100.000 de interés: pagar 90.000 nunca liquida
    expect(monthsToPayoff(2_000_000, 50_000, 90_000)).toBe(Number.POSITIVE_INFINITY);
    expect(buildSchedule(2_000_000, 50_000, 90_000)).toHaveLength(0);
  });

  it('la tabla nunca deja saldo negativo', () => {
    const schedule = buildSchedule(500_000, 30_000, 200_000);
    for (const row of schedule) {
      expect(row.balanceMinorUnits).toBeGreaterThanOrEqual(0);
      expect(row.principalMinorUnits).toBeGreaterThan(0);
    }
    expect(schedule[schedule.length - 1]?.balanceMinorUnits).toBe(0);
  });

  it('la TEM media ponderada pesa por saldo', () => {
    const debts: PayoffDebtInput[] = [
      { id: 'a', name: 'A', balanceMinorUnits: 1_000_000, monthlyRateMicro: 10_000, installmentMinorUnits: 1 },
      { id: 'b', name: 'B', balanceMinorUnits: 3_000_000, monthlyRateMicro: 30_000, installmentMinorUnits: 1 },
    ];
    expect(weightedAverageRate(debts)).toBe(25_000);
  });

  describe('plan de liquidación', () => {
    // Ojo: la de mayor interés (tarjeta) NO es la de menor saldo, que es
    // justo el caso en el que avalancha y bola de nieve se diferencian.
    const debts: PayoffDebtInput[] = [
      {
        id: 'tarjeta',
        name: 'Tarjeta',
        balanceMinorUnits: 3_000_000,
        monthlyRateMicro: 35_000,
        installmentMinorUnits: 500_000,
      },
      {
        id: 'banco',
        name: 'Banco',
        balanceMinorUnits: 2_000_000,
        monthlyRateMicro: 15_000,
        installmentMinorUnits: 300_000,
      },
    ];

    it('avalancha paga menos intereses que bola de nieve', () => {
      const avalanche = simulatePayoff(debts, 200_000, 'AVALANCHE');
      const snowball = simulatePayoff(debts, 200_000, 'SNOWBALL');
      expect(avalanche.totalInterestMinorUnits).toBeLessThan(snowball.totalInterestMinorUnits);
    });

    it('avalancha ataca primero la de mayor interés y bola de nieve la de menor saldo', () => {
      expect(simulatePayoff(debts, 200_000, 'AVALANCHE').payoffOrder[0]?.id).toBe('tarjeta');
      expect(simulatePayoff(debts, 200_000, 'SNOWBALL').payoffOrder[0]?.id).toBe('banco');
    });

    it('aportar más cada mes liquida antes y ahorra intereses', () => {
      const sinExtra = simulatePayoff(debts, 0, 'AVALANCHE');
      const conExtra = simulatePayoff(debts, 300_000, 'AVALANCHE');
      expect(conExtra.months).toBeLessThan(sinExtra.months);
      expect(conExtra.totalInterestMinorUnits).toBeLessThan(sinExtra.totalInterestMinorUnits);
    });

    it('termina con todas las deudas en cero', () => {
      const result = simulatePayoff(debts, 150_000, 'AVALANCHE');
      expect(result.payoffOrder).toHaveLength(2);
      expect(result.schedule[result.schedule.length - 1]?.totalBalanceMinorUnits).toBe(0);
    });

    it('no se queda en bucle si las cuotas no cubren los intereses', () => {
      const impagable: PayoffDebtInput[] = [
        {
          id: 'gota',
          name: 'Gota a gota',
          balanceMinorUnits: 1_000_000,
          monthlyRateMicro: 200_000,
          installmentMinorUnits: 100_000,
        },
      ];
      const result = simulatePayoff(impagable, 0, 'AVALANCHE');
      expect(result.months).toBe(600);
      expect(result.schedule[result.schedule.length - 1]?.totalBalanceMinorUnits).toBeGreaterThan(0);
    });
  });
});
