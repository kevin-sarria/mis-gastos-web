import { prisma } from '../../lib/prisma';
import type { CurrencyCreateInput, CurrencyUpdateInput } from './currency.schemas';

export const currencyRepository = {
  findByCode(code: string) {
    return prisma.currency.findUnique({ where: { code } });
  },

  findDefault() {
    return prisma.currency.findFirst({ where: { isActive: true, isDefault: true } });
  },

  findFirstActive() {
    return prisma.currency.findFirst({ where: { isActive: true }, orderBy: { code: 'asc' } });
  },

  listActive() {
    return prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } });
  },

  listAll() {
    return prisma.currency.findMany({ orderBy: { code: 'asc' } });
  },

  create(data: CurrencyCreateInput) {
    return prisma.currency.create({ data });
  },

  update(code: string, data: CurrencyUpdateInput) {
    return prisma.currency.update({ where: { code }, data });
  },
};
