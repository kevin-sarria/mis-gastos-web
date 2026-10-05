import { z } from 'zod';

export const budgetCreateSchema = z.object({
  categoryId: z.string().nullish(),
  name: z.string().trim().min(1).max(120),
  amountMinorUnits: z.number().int().positive(),
  period: z.enum(['MONTHLY', 'WEEKLY']).default('MONTHLY'),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
});

export const budgetUpdateSchema = budgetCreateSchema.partial();

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
export type BudgetUpdateInput = z.infer<typeof budgetUpdateSchema>;
