import { z } from 'zod';

export const incomeCreateSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  amountMinorUnits: z.number().int().positive(),
  frequency: z.enum(['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  date: z.coerce.date(),
  note: z.string().trim().max(500).nullish(),
});

export const incomeUpdateSchema = incomeCreateSchema.partial();

export type IncomeCreateInput = z.infer<typeof incomeCreateSchema>;
export type IncomeUpdateInput = z.infer<typeof incomeUpdateSchema>;
