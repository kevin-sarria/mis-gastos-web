import type { Budget } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../shared/errors/app-error';
import { currentMonthRange } from '../../shared/utils/finance';
import { budgetRepository } from '../budgets/budget.repository';
import { alertRepository } from './alert.repository';

class AlertService {
  list(userId: string) {
    return alertRepository.list(userId);
  }

  async markRead(userId: string, id: string) {
    const alert = await alertRepository.findById(id, userId);
    if (!alert) {
      throw new NotFoundError('Alerta no encontrada');
    }
    return alertRepository.markRead(id);
  }

  async evaluateAll(userId: string): Promise<void> {
    const budgets = await budgetRepository.listActive(userId);
    for (const budget of budgets) {
      await this.evaluateBudget(userId, budget);
    }
  }

  private async evaluateBudget(userId: string, budget: Budget): Promise<void> {
    if (budget.amountMinorUnits <= 0) {
      return;
    }

    const spending = await this.computeSpending(userId, budget.categoryId);
    const ratio = spending / budget.amountMinorUnits;

    await alertRepository.clearBudgetAlerts(userId, budget.categoryId);

    if (ratio >= 1) {
      await alertRepository.create({
        userId,
        type: 'OVER_BUDGET',
        categoryId: budget.categoryId,
        severity: 'CRITICAL',
        params: {
          budgetName: budget.name,
          spentMinorUnits: spending,
          limitMinorUnits: budget.amountMinorUnits,
        },
      });
    } else if (ratio >= budget.alertThresholdPct / 100) {
      await alertRepository.create({
        userId,
        type: 'NEAR_BUDGET',
        categoryId: budget.categoryId,
        severity: 'WARNING',
        params: {
          budgetName: budget.name,
          spentMinorUnits: spending,
          limitMinorUnits: budget.amountMinorUnits,
        },
      });
    }
  }

  private async computeSpending(userId: string, categoryId: string | null): Promise<number> {
    const { start, end } = currentMonthRange();
    const aggregate = await prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: start, lt: end },
        ...(categoryId ? { categoryId } : {}),
      },
      _sum: { amountMinorUnits: true },
    });
    return aggregate._sum.amountMinorUnits ?? 0;
  }
}

export const alertService = new AlertService();
