import { prisma } from '../../lib/prisma';
import {
  currentMonthRange,
  groupByCategory,
  isRecurringIncomeActiveInMonth,
  previousMonthRange,
  sumAmounts,
} from '../../shared/utils/finance';
import type { MonthRange } from '../../shared/utils/finance';

function formatMonth(range: MonthRange): string {
  return `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`;
}

function ratioChange(previous: number, current: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return (current - previous) / previous;
}

export const dashboardService = {
  async getSummary(userId: string) {
    const range = currentMonthRange();
    const previous = previousMonthRange();

    const [incomes, expenses, activeAlerts] = await Promise.all([
      prisma.income.findMany({ where: { userId }, include: { category: true } }),
      prisma.expense.findMany({ where: { userId }, include: { category: true, tags: true } }),
      prisma.alert.count({ where: { userId, readAt: null } }),
    ]);

    const monthlyIncomes = incomes.filter((income) =>
      isRecurringIncomeActiveInMonth(income.frequency, income.date, range),
    );
    const monthlyExpenses = expenses.filter(
      (expense) => expense.date >= range.start && expense.date < range.end,
    );

    const totalIncome = sumAmounts(monthlyIncomes);
    const totalExpenses = sumAmounts(monthlyExpenses);

    const topCategories = groupByCategory(
      monthlyExpenses.map((expense) => ({
        categoryId: expense.categoryId,
        categoryName: expense.category?.name ?? 'Sin categoría',
        amountMinorUnits: expense.amountMinorUnits,
      })),
    ).slice(0, 5);

    const previousIncomeTotal = sumAmounts(
      incomes.filter((income) =>
        isRecurringIncomeActiveInMonth(income.frequency, income.date, previous),
      ),
    );
    const previousExpensesTotal = sumAmounts(
      expenses.filter((expense) => expense.date >= previous.start && expense.date < previous.end),
    );

    return {
      month: formatMonth(range),
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      topCategories,
      activeAlerts,
      trends: {
        income: ratioChange(previousIncomeTotal, totalIncome),
        expenses: ratioChange(previousExpensesTotal, totalExpenses),
      },
    };
  },
};
