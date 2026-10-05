import { z } from 'zod';

export const EXPENSE_TAGS = ['FIXED', 'VARIABLE', 'EMERGENCY', 'ANT_EXPENSE'] as const;

export const expenseCreateSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  amountMinorUnits: z.number().int().positive(),
  date: z.coerce.date(),
  tags: z.array(z.enum(EXPENSE_TAGS)).default([]),
  justification: z.string().trim().max(2000).nullish(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
