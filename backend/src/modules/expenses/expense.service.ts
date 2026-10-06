import { NotFoundError } from '../../shared/errors/app-error';
import type { MonthRange } from '../../shared/utils/finance';
import { alertService } from '../alerts/alert.service';
import { expenseRepository } from './expense.repository';
import type { ExpenseCreateInput, ExpenseUpdateInput } from './expense.schemas';

export const expenseService = {
  list(userId: string, range: MonthRange) {
    return expenseRepository.list(userId, range);
  },

  async create(userId: string, input: ExpenseCreateInput) {
    const expense = await expenseRepository.create(userId, input);
    await alertService.evaluateAll(userId);
    return expense;
  },

  async update(userId: string, id: string, input: ExpenseUpdateInput) {
    const expense = await expenseRepository.update(id, userId, input);
    if (!expense) {
      throw new NotFoundError('Gasto no encontrado');
    }
    await alertService.evaluateAll(userId);
    return expense;
  },

  async remove(userId: string, id: string) {
    const result = await expenseRepository.remove(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Gasto no encontrado');
    }
    await alertService.evaluateAll(userId);
  },
};
