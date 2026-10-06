import { prisma } from '../../lib/prisma';
import {
  formatMonthKey,
  groupByCategory,
  previousMonthOf,
  sumAmounts,
} from '../../shared/utils/finance';
import type { MonthRange } from '../../shared/utils/finance';

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

    return {
      month: formatMonthKey(range),
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories,
      activeAlerts,
      trends: {
        income: ratioChange(previousIncome._sum.amountMinorUnits ?? 0, totalIncome),
        expenses: ratioChange(previousExpenses._sum.amountMinorUnits ?? 0, totalExpenses),
      },
    };
  },
};
