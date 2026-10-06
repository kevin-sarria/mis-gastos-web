import { NotFoundError } from '../../shared/errors/app-error';
import type { MonthRange } from '../../shared/utils/finance';
import { incomeRepository } from './income.repository';
import type { IncomeCreateInput, IncomeUpdateInput } from './income.schemas';

export const incomeService = {
  list(userId: string, range: MonthRange) {
    return incomeRepository.list(userId, range);
  },

  create(userId: string, input: IncomeCreateInput) {
    return incomeRepository.create(userId, input);
  },

  async update(userId: string, id: string, input: IncomeUpdateInput) {
    const income = await incomeRepository.update(id, userId, input);
    if (!income) {
      throw new NotFoundError('Ingreso no encontrado');
    }
    return income;
  },

  async remove(userId: string, id: string) {
    const result = await incomeRepository.remove(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Ingreso no encontrado');
    }
  },
};
