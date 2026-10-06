import { prisma } from '../../lib/prisma';
import type { MonthRange } from '../../shared/utils/finance';
import type { ExpenseCreateInput, ExpenseUpdateInput } from './expense.schemas';

const include = { category: true, tags: true, attachments: true } as const;

export const expenseRepository = {
  list(userId: string, range: MonthRange) {
    return prisma.expense.findMany({
      where: { userId, date: { gte: range.start, lt: range.end } },
      include,
      orderBy: { date: 'desc' },
    });
  },

  findById(id: string, userId: string) {
    return prisma.expense.findFirst({ where: { id, userId }, include });
  },

  create(userId: string, data: ExpenseCreateInput) {
    const { tags, ...rest } = data;
    return prisma.expense.create({
      data: {
        ...rest,
        userId,
        tags: { create: tags.map((tag) => ({ tag })) },
      },
      include,
    });
  },

  async update(id: string, userId: string, data: ExpenseUpdateInput) {
    const { tags, ...rest } = data;

    // updateMany no admite escrituras anidadas, así que comprobamos la
    // propiedad primero y luego usamos update (que sí las soporta).
    const existing = await prisma.expense.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }

    return prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        ...(tags
          ? { tags: { deleteMany: {}, create: tags.map((tag) => ({ tag })) } }
          : {}),
      },
      include,
    });
  },

  remove(id: string, userId: string) {
    return prisma.expense.deleteMany({ where: { id, userId } });
  },
};
