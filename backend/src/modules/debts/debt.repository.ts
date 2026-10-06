import { prisma } from '../../lib/prisma';
import type { DebtCreateInput, DebtUpdateInput, PaymentCreateInput } from './debt.schemas';

const paymentInclude = { payments: { orderBy: { date: 'desc' as const } } };

export const debtRepository = {
  list(userId: string) {
    return prisma.debt.findMany({
      where: { userId },
      include: paymentInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findById(id: string, userId: string) {
    return prisma.debt.findFirst({ where: { id, userId }, include: paymentInclude });
  },

  create(userId: string, data: DebtCreateInput) {
    return prisma.debt.create({ data: { ...data, userId }, include: paymentInclude });
  },

  async update(id: string, userId: string, data: DebtUpdateInput) {
    const existing = await prisma.debt.findFirst({ where: { id, userId }, select: { id: true } });
    if (!existing) {
      return null;
    }
    return prisma.debt.update({ where: { id }, data, include: paymentInclude });
  },

  remove(id: string, userId: string) {
    return prisma.debt.deleteMany({ where: { id, userId } });
  },

  async addPayment(id: string, userId: string, data: PaymentCreateInput) {
    const debt = await prisma.debt.findFirst({ where: { id, userId } });
    if (!debt) {
      return null;
    }

    const nextBalance = Math.max(debt.balanceMinorUnits - data.amountMinorUnits, 0);

    await prisma.debtPayment.create({ data: { ...data, debtId: id } });

    return prisma.debt.update({
      where: { id },
      data: {
        balanceMinorUnits: nextBalance,
        ...(nextBalance === 0 ? { status: 'PAID' as const } : {}),
      },
      include: paymentInclude,
    });
  },
};
