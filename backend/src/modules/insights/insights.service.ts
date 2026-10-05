import { prisma } from '../../lib/prisma';
import {
  currentMonthRange,
  groupByCategory,
  isRecurringIncomeActiveInMonth,
  previousMonthRange,
  sumAmounts,
} from '../../shared/utils/finance';
import type { MonthRange } from '../../shared/utils/finance';
import { detectCuttableExpenses, generateInsights } from './insights.engine';

function formatMonth(range: MonthRange): string {
  return `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`;
}

export const insightsService = {
  async getForUser(userId: string) {
    const range = currentMonthRange();
    const previous = previousMonthRange();

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({ where: { userId }, include: { category: true } }),
      prisma.expense.findMany({ where: { userId }, include: { category: true, tags: true } }),
    ]);

    const monthlyIncomes = incomes.filter((income) =>
      isRecurringIncomeActiveInMonth(income.frequency, income.date, range),
    );
    const monthlyExpenses = expenses.filter(
      (expense) => expense.date >= range.start && expense.date < range.end,
    );
    const previousExpenses = expenses.filter(
      (expense) => expense.date >= previous.start && expense.date < previous.end,
    );

    const totalIncome = sumAmounts(monthlyIncomes);
    const totalExpenses = sumAmounts(monthlyExpenses);
    const antExpenseTotal = sumAmounts(
      monthlyExpenses.filter((expense) => expense.tags.some((t) => t.tag === 'ANT_EXPENSE')),
    );

    const topCategory = groupByCategory(
      monthlyExpenses.map((expense) => ({
        categoryId: expense.categoryId,
        categoryName: expense.category?.name ?? 'Sin categoría',
        amountMinorUnits: expense.amountMinorUnits,
      })),
    )[0];

    const monthsTracked = await this.countMonthsTracked(userId);

    const insights = generateInsights({
      totalIncome,
      totalExpenses,
      antExpenseTotal,
      currentExpenses: totalExpenses,
      previousExpenses: sumAmounts(previousExpenses),
      topCategory: topCategory ? { name: topCategory.name, total: topCategory.total } : undefined,
      monthsTracked,
    });

    const cuttableExpenses = detectCuttableExpenses(
      monthlyExpenses.map((expense) => ({
        title: expense.title,
        categoryName: expense.category?.name ?? 'Sin categoría',
        tags: expense.tags.map((t) => t.tag),
        amountMinorUnits: expense.amountMinorUnits,
      })),
    );

    return { month: formatMonth(range), insights, cuttableExpenses };
  },

  async countMonthsTracked(userId: string): Promise<number> {
    const firstExpense = await prisma.expense.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
    });
    const firstIncome = await prisma.income.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    const first = firstExpense ?? firstIncome;
    if (!first) {
      return 0;
    }

    const now = new Date();
    const months =
      (now.getFullYear() - first.date.getFullYear()) * 12 +
      (now.getMonth() - first.date.getMonth()) +
      1;

    return Math.max(months, 1);
  },
};
