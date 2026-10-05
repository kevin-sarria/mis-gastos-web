import { NotFoundError } from '../../shared/errors/app-error';
import { incomeRepository } from './income.repository';
import type { IncomeCreateInput, IncomeUpdateInput } from './income.schemas';

export const incomeService = {
  list(userId: string) {
    return incomeRepository.list(userId);
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
