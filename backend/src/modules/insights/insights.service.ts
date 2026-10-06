import { prisma } from '../../lib/prisma';
import {
  formatMonthKey,
  groupByCategory,
  previousMonthOf,
  sumAmounts,
} from '../../shared/utils/finance';
import type { MonthRange } from '../../shared/utils/finance';
import { detectCuttableExpenses, generateInsights } from './insights.engine';

export const insightsService = {
  async getForUser(userId: string, range: MonthRange) {
    const previous = previousMonthOf(range);

    const [incomes, expenses, previousExpenses] = await Promise.all([
      prisma.income.findMany({
        where: { userId, date: { gte: range.start, lt: range.end } },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: range.start, lt: range.end } },
        include: { category: true, tags: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: previous.start, lt: previous.end } },
        _sum: { amountMinorUnits: true },
      }),
    ]);

    const totalIncome = sumAmounts(incomes);
    const totalExpenses = sumAmounts(expenses);
    const antExpenseTotal = sumAmounts(
      expenses.filter((expense) => expense.tags.some((tag) => tag.tag === 'ANT_EXPENSE')),
    );

    const topCategory = groupByCategory(
      expenses.map((expense) => ({
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
      previousExpenses: previousExpenses._sum.amountMinorUnits ?? 0,
      topCategory: topCategory ? { name: topCategory.name, total: topCategory.total } : undefined,
      monthsTracked,
    });

    const cuttableExpenses = detectCuttableExpenses(
      expenses.map((expense) => ({
        title: expense.title,
        categoryName: expense.category?.name ?? 'Sin categoría',
        tags: expense.tags.map((tag) => tag.tag),
        amountMinorUnits: expense.amountMinorUnits,
      })),
    );

    return { month: formatMonthKey(range), insights, cuttableExpenses };
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
