import { z } from 'zod';

export const budgetFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre').max(120),
  amount: z.string().regex(/^\d+([.,]\d+)?$/, 'Monto inválido'),
  categoryId: z.string(),
  alertThresholdPct: z.number().int().min(1).max(100),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
