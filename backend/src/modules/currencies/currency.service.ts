import { ConflictError, NotFoundError } from '../../shared/errors/app-error';
import { currencyRepository } from './currency.repository';
import type { CurrencyCreateInput, CurrencyUpdateInput } from './currency.schemas';

export const currencyService = {
  listActive() {
    return currencyRepository.listActive();
  },

  listAll() {
    return currencyRepository.listAll();
  },

  async create(input: CurrencyCreateInput) {
    const existing = await currencyRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictError('Ya existe una moneda con ese código');
    }
    return currencyRepository.create(input);
  },

  async update(code: string, input: CurrencyUpdateInput) {
    const existing = await currencyRepository.findByCode(code);
    if (!existing) {
      throw new NotFoundError('Moneda no encontrada');
    }
    return currencyRepository.update(code, input);
  },
};
