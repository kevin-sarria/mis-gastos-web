import { prisma } from '../../lib/prisma';
import {
  currentMonthRange,
  formatMonthKey,
  groupByCategory,
  previousMonthOf,
  sumAmounts,
} from '../../shared/utils/finance';
import type { MonthRange } from '../../shared/utils/finance';
import { debtService } from '../debts/debt.service';

function ratioChange(previous: number, current: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return (current - previous) / previous;
}

export const dashboardService = {
  async getSummary(userId: string, range: MonthRange) {
    const previous = previousMonthOf(range);

    const [incomes, expenses, previousIncome, previousExpenses, activeAlerts] = await Promise.all([
      prisma.income.findMany({
        where: { userId, date: { gte: range.start, lt: range.end } },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: range.start, lt: range.end } },
        include: { category: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: previous.start, lt: previous.end } },
        _sum: { amountMinorUnits: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: previous.start, lt: previous.end } },
        _sum: { amountMinorUnits: true },
      }),
      prisma.alert.count({ where: { userId, readAt: null } }),
    ]);

    const totalIncome = sumAmounts(incomes);
    const totalExpenses = sumAmounts(expenses);

    const topCategories = groupByCategory(
      expenses.map((expense) => ({
        categoryId: expense.categoryId,
        categoryName: expense.category?.name ?? 'Sin categoría',
        amountMinorUnits: expense.amountMinorUnits,
      })),
    ).slice(0, 5);

    // Las deudas solo se proyectan para el mes en curso: el plan es "ahora".
    const isCurrentMonth = formatMonthKey(range) === formatMonthKey(currentMonthRange());
    const [plan, debtData] = isCurrentMonth
      ? await Promise.all([debtService.currentMonthPlan(userId), debtService.list(userId)])
      : [null, null];

    const debtPayments = plan?.plannedTotalMinorUnits ?? debtData?.summary.totalMonthlyPaymentMinorUnits ?? 0;
    const debtPaid = plan?.paidTotalMinorUnits ?? 0;
    const balance = totalIncome - totalExpenses;

    return {
      month: formatMonthKey(range),
      totalIncome,
      totalExpenses,
      balance,
      topCategories,
      activeAlerts,
      isCurrentMonth,
      debts: {
        hasPlan: Boolean(plan),
        paymentsMinorUnits: debtPayments,
        paidMinorUnits: debtPaid,
        remainingMinorUnits: Math.max(debtPayments - debtPaid, 0),
        totalBalanceMinorUnits: debtData?.summary.totalBalanceMinorUnits ?? 0,
        monthsToFreedom: plan?.monthsToFreedom ?? null,
        /** Lo que te queda de verdad: ingresos - gastos - deudas. */
        afterDebtsMinorUnits: balance - debtPayments,
      },
      trends: {
        income: ratioChange(previousIncome._sum.amountMinorUnits ?? 0, totalIncome),
        expenses: ratioChange(previousExpenses._sum.amountMinorUnits ?? 0, totalExpenses),
      },
    };
  },
};
