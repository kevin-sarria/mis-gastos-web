import { NotFoundError } from '../../shared/errors/app-error';
import { alertService } from '../alerts/alert.service';
import { budgetRepository } from './budget.repository';
import type { BudgetCreateInput, BudgetUpdateInput } from './budget.schemas';

export const budgetService = {
  list(userId: string) {
    return budgetRepository.list(userId);
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
