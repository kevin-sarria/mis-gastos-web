import { prisma } from '../../lib/prisma';
import type { IncomeCreateInput, IncomeUpdateInput } from './income.schemas';

export const incomeRepository = {
  list(userId: string) {
    return prisma.income.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  },

  findById(id: string, userId: string) {
    return prisma.income.findFirst({ where: { id, userId }, include: { category: true } });
  },

  create(userId: string, data: IncomeCreateInput) {
    return prisma.income.create({ data: { ...data, userId }, include: { category: true } });
  },

  async update(id: string, userId: string, data: IncomeUpdateInput) {
    await prisma.income.updateMany({ where: { id, userId }, data });
    return prisma.income.findFirst({ where: { id, userId }, include: { category: true } });
  },

  remove(id: string, userId: string) {
    return prisma.income.deleteMany({ where: { id, userId } });
  },
};
