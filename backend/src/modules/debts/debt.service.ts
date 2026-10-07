import type { Debt } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors/app-error';
import { currentMonthRange } from '../../shared/utils/finance';
import {
  buildSchedule,
  simulateByPayment,
  simulateByTerm,
  simulatePayoff,
  teaFromTem,
  weightedAverageRate,
  type PayoffDebtInput,
  type PayoffResult,
} from '../../shared/utils/debt';
import { debtRepository } from './debt.repository';
import type {
  DebtCreateInput,
  DebtUpdateInput,
  PaymentCreateInput,
  PayoffPlanInput,
  PlanSaveInput,
  SimulatorInput,
} from './debt.schemas';

export interface DebtAnalysis {
  liquidated: boolean;
  monthsToPayoff: number | null;
  totalInterestMinorUnits: number;
  totalPaidMinorUnits: number;
  /** De la primera cuota, cuánto se va en intereses. */
  firstPaymentInterestMinorUnits: number;
}

function analyze(debt: Pick<Debt, 'balanceMinorUnits' | 'monthlyRateMicro' | 'installmentMinorUnits'>) {
  const schedule = buildSchedule(
    debt.balanceMinorUnits,
    debt.monthlyRateMicro,
    debt.installmentMinorUnits,
  );
  const last = schedule[schedule.length - 1];
  const liquidated = Boolean(last) && last?.balanceMinorUnits === 0;

  const analysis: DebtAnalysis = {
    liquidated,
    monthsToPayoff: liquidated ? schedule.length : null,
    totalInterestMinorUnits: schedule.reduce((sum, row) => sum + row.interestMinorUnits, 0),
    totalPaidMinorUnits: schedule.reduce((sum, row) => sum + row.paymentMinorUnits, 0),
    firstPaymentInterestMinorUnits: schedule[0]?.interestMinorUnits ?? 0,
  };

  return { analysis, teaMicro: teaFromTem(debt.monthlyRateMicro) };
}

function activeDebts(debts: Debt[]): PayoffDebtInput[] {
  return debts
    .filter((debt) => debt.status === 'ACTIVE' && debt.balanceMinorUnits > 0)
    .map((debt) => ({
      id: debt.id,
      name: debt.name,
      balanceMinorUnits: debt.balanceMinorUnits,
      monthlyRateMicro: debt.monthlyRateMicro,
      installmentMinorUnits: debt.installmentMinorUnits,
    }));
}

/**
 * Una deuda de pago único no tiene cuota: se debe todo el saldo de golpe.
 * Se normaliza a "1 sola cuota = saldo completo" para que el motor, el plan
 * y el balance la traten igual que cualquier otra deuda.
 */
function normalizeSinglePayment(input: DebtCreateInput | DebtUpdateInput) {
  if (!input.isSinglePayment) {
    return input;
  }
  return {
    ...input,
    installmentMinorUnits: input.balanceMinorUnits ?? input.installmentMinorUnits,
    remainingMonths: 1,
  };
}

export const debtService = {
  async list(userId: string) {
    const debts = await debtRepository.list(userId);
    const withAnalysis = debts.map((debt) => ({ ...debt, ...analyze(debt) }));
    const active = activeDebts(debts);
    const totalBalance = active.reduce((sum, debt) => sum + debt.balanceMinorUnits, 0);
    const totalMonthly = active.reduce((sum, debt) => sum + debt.installmentMinorUnits, 0);

    return {
      debts: withAnalysis,
      summary: {
        activeCount: active.length,
        totalBalanceMinorUnits: totalBalance,
        totalMonthlyPaymentMinorUnits: totalMonthly,
        weightedAverageRateMicro: weightedAverageRate(active),
        /** Cuánto pagarías de intereses si sigues pagando solo la cuota. */
        totalInterestIfMinimumMinorUnits: withAnalysis
          .filter((debt) => debt.status === 'ACTIVE')
          .reduce((sum, debt) => sum + debt.analysis.totalInterestMinorUnits, 0),
      },
    };
  },

  async get(userId: string, id: string) {
    const debt = await debtRepository.findById(id, userId);
    if (!debt) {
      throw new NotFoundError('Deuda no encontrada');
    }
    return { ...debt, ...analyze(debt) };
  },

  create(userId: string, input: DebtCreateInput) {
    return debtRepository.create(userId, normalizeSinglePayment(input) as DebtCreateInput);
  },

  async update(userId: string, id: string, input: DebtUpdateInput) {
    const debt = await debtRepository.update(
      id,
      userId,
      normalizeSinglePayment(input) as DebtUpdateInput,
    );
    if (!debt) {
      throw new NotFoundError('Deuda no encontrada');
    }
    return { ...debt, ...analyze(debt) };
  },

  async remove(userId: string, id: string) {
    const result = await debtRepository.remove(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Deuda no encontrada');
    }
  },

  async addPayment(userId: string, id: string, input: PaymentCreateInput) {
    const debt = await debtRepository.addPayment(id, userId, input);
    if (!debt) {
      throw new NotFoundError('Deuda no encontrada');
    }
    return { ...debt, ...analyze(debt) };
  },

  simulate(input: SimulatorInput) {
    const result = input.months
      ? simulateByTerm(input.amountMinorUnits, input.monthlyRateMicro, input.months)
      : simulateByPayment(
          input.amountMinorUnits,
          input.monthlyRateMicro,
          input.paymentMinorUnits ?? 0,
        );

    const viable = Number.isFinite(result.months);
    const monthlyRate = input.monthlyRateMicro / 1_000_000;

    return {
      ...result,
      months: viable ? result.months : null,
      viable,
      /** Cuánto de la primera cuota son intereses (0-100). */
      firstPaymentInterestSharePct:
        result.monthlyPaymentMinorUnits > 0
          ? Math.round(
              ((input.amountMinorUnits * monthlyRate) / result.monthlyPaymentMinorUnits) * 100,
            )
          : 0,
      /** Intereses como % de lo prestado. */
      interestOverPrincipalPct:
        input.amountMinorUnits > 0
          ? Math.round((result.totalInterestMinorUnits / input.amountMinorUnits) * 100)
          : 0,
    };
  },

  payoffPlan(userId: string, input: PayoffPlanInput) {
    const plans = debtService.buildPlans(userId, input.extraMonthlyMinorUnits);
    return plans;
  },

  async buildPlans(userId: string, extraMonthlyMinorUnits: number) {
    const debts = await debtRepository.list(userId);
    const active = activeDebts(debts);

    const build = (extra: number, strategy: 'AVALANCHE' | 'SNOWBALL'): PayoffResult =>
      simulatePayoff(active, extra, strategy);

    const minimumsOnly = build(0, 'AVALANCHE');
    const avalanche = build(extraMonthlyMinorUnits, 'AVALANCHE');
    const snowball = build(extraMonthlyMinorUnits, 'SNOWBALL');

    return {
      debts: active,
      extraMonthlyMinorUnits,
      totalBalanceMinorUnits: active.reduce((sum, debt) => sum + debt.balanceMinorUnits, 0),
      totalMonthlyPaymentMinorUnits: active.reduce(
        (sum, debt) => sum + debt.installmentMinorUnits,
        0,
      ),
      weightedAverageRateMicro: weightedAverageRate(active),
      plans: { minimumsOnly, avalanche, snowball },
      /** Ahorro del plan recomendado frente a seguir pagando solo lo mínimo. */
      savingsVsMinimumsMinorUnits: Math.max(
        minimumsOnly.totalInterestMinorUnits - avalanche.totalInterestMinorUnits,
        0,
      ),
      monthsSavedVsMinimums: Math.max(minimumsOnly.months - avalanche.months, 0),
    };
  },

  // ============================================================
  // Plan activo: se guarda la decisión (estrategia + aporte) y el
  // "qué pagar este mes" se recalcula desde el saldo real.
  // ============================================================

  async currentMonthPlan(userId: string) {
    const [plan, debts] = await Promise.all([
      prisma.debtPlan.findUnique({ where: { userId } }),
      debtRepository.list(userId),
    ]);

    if (!plan?.isActive) {
      return null;
    }

    const active = activeDebts(debts);
    const simulation = simulatePayoff(active, plan.extraMonthlyMinorUnits, plan.strategy);
    const firstMonth = simulation.schedule[0];

    // Lo que ya pagaste este mes, leído de los pagos registrados.
    const { start, end } = currentMonthRange();
    const paidByDebt = new Map<string, number>();
    for (const debt of debts) {
      for (const payment of debt.payments) {
        if (payment.date >= start && payment.date < end) {
          paidByDebt.set(debt.id, (paidByDebt.get(debt.id) ?? 0) + payment.amountMinorUnits);
        }
      }
    }

    const items = (firstMonth?.payments ?? []).map((payment) => {
      const paid = paidByDebt.get(payment.id) ?? 0;
      return {
        debtId: payment.id,
        name: payment.name,
        plannedMinorUnits: payment.amountMinorUnits,
        paidMinorUnits: paid,
        isPaid: paid >= payment.amountMinorUnits,
      };
    });

    return {
      strategy: plan.strategy,
      extraMonthlyMinorUnits: plan.extraMonthlyMinorUnits,
      startedAt: plan.startedAt,
      items,
      plannedTotalMinorUnits: items.reduce((sum, item) => sum + item.plannedMinorUnits, 0),
      paidTotalMinorUnits: items.reduce((sum, item) => sum + item.paidMinorUnits, 0),
      monthsToFreedom: simulation.months,
      totalInterestMinorUnits: simulation.totalInterestMinorUnits,
      totalBalanceMinorUnits: active.reduce((sum, debt) => sum + debt.balanceMinorUnits, 0),
    };
  },

  async savePlan(userId: string, input: PlanSaveInput) {
    await prisma.debtPlan.upsert({
      where: { userId },
      create: {
        userId,
        strategy: input.strategy,
        extraMonthlyMinorUnits: input.extraMonthlyMinorUnits,
        startedAt: new Date(),
        isActive: true,
      },
      update: {
        strategy: input.strategy,
        extraMonthlyMinorUnits: input.extraMonthlyMinorUnits,
        isActive: true,
      },
    });

    return this.currentMonthPlan(userId);
  },

  async deletePlan(userId: string) {
    await prisma.debtPlan.updateMany({ where: { userId }, data: { isActive: false } });
  },
};
