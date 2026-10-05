import type { AlertType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const alertRepository = {
  list(userId: string) {
    return prisma.alert.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  findById(id: string, userId: string) {
    return prisma.alert.findFirst({ where: { id, userId } });
  },

  markRead(id: string) {
    return prisma.alert.update({ where: { id }, data: { readAt: new Date() } });
  },

  clearBudgetAlerts(userId: string, categoryId: string | null) {
    return prisma.alert.deleteMany({
      where: {
        userId,
        categoryId: categoryId ?? null,
        type: { in: ['OVER_BUDGET', 'NEAR_BUDGET'] },
        readAt: null,
      },
    });
  },

  create(data: {
    userId: string;
    type: AlertType;
    categoryId: string | null;
    severity: string;
    message: string;
  }) {
    return prisma.alert.create({ data });
  },
};
