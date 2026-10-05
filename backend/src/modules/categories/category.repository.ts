import type { CategoryType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { CategoryCreateInput, CategoryUpdateInput } from './category.schemas';

export const categoryRepository = {
  listForUser(userId: string, type?: CategoryType) {
    return prisma.category.findMany({
      where: {
        ...(type ? { type } : {}),
        OR: [{ userId: null }, { userId }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  create(userId: string, data: CategoryCreateInput) {
    return prisma.category.create({ data: { ...data, userId } });
  },

  update(id: string, data: CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
