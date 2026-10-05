import { prisma } from '../../lib/prisma';
import type { BudgetCreateInput, BudgetUpdateInput } from './budget.schemas';

const include = { category: true } as const;

export const budgetRepository = {
  list(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    });
  },

  listActive(userId: string) {
    return prisma.budget.findMany({ where: { userId, isActive: true }, include });
  },

  findById(id: string, userId: string) {
    return prisma.budget.findFirst({ where: { id, userId }, include });
  },

  create(userId: string, data: BudgetCreateInput) {
    return prisma.budget.create({ data: { ...data, userId }, include });
  },

  async update(id: string, userId: string, data: BudgetUpdateInput) {
    await prisma.budget.updateMany({ where: { id, userId }, data });
    return prisma.budget.findFirst({ where: { id, userId }, include });
  },

  remove(id: string, userId: string) {
    return prisma.budget.deleteMany({ where: { id, userId } });
  },
};
