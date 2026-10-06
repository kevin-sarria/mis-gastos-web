import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors/app-error';
import type { MonthRange } from '../../shared/utils/finance';
import { alertService } from '../alerts/alert.service';
import { budgetRepository } from './budget.repository';
import type { BudgetCreateInput, BudgetUpdateInput } from './budget.schemas';

export const budgetService = {
  async list(userId: string, range: MonthRange) {
    const [budgets, expenses] = await Promise.all([
      budgetRepository.list(userId),
      prisma.expense.findMany({
        where: { userId, date: { gte: range.start, lt: range.end } },
        select: { categoryId: true, amountMinorUnits: true },
      }),
    ]);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amountMinorUnits, 0);
    const spentByCategory = new Map<string, number>();

    for (const expense of expenses) {
      spentByCategory.set(
        expense.categoryId,
        (spentByCategory.get(expense.categoryId) ?? 0) + expense.amountMinorUnits,
      );
    }

    return budgets.map((budget) => ({
      ...budget,
      spentMinorUnits: budget.categoryId
        ? (spentByCategory.get(budget.categoryId) ?? 0)
        : totalSpent,
    }));
  },

  async create(userId: string, input: BudgetCreateInput) {
    const budget = await budgetRepository.create(userId, input);
    await alertService.evaluateAll(userId);
    return budget;
  },

  async update(userId: string, id: string, input: BudgetUpdateInput) {
    const budget = await budgetRepository.update(id, userId, input);
    if (!budget) {
      throw new NotFoundError('Presupuesto no encontrado');
    }
    await alertService.evaluateAll(userId);
    return budget;
  },

  async remove(userId: string, id: string) {
    const result = await budgetRepository.remove(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Presupuesto no encontrado');
    }
    await alertService.evaluateAll(userId);
  },
};
