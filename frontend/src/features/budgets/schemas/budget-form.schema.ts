import { z } from 'zod';

export const budgetFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre').max(120),
  amount: z
    .string()
    .min(1, 'Indica el monto')
    .regex(/^\d+$/, 'Monto inválido')
    .refine((value) => Number(value) > 0, 'El monto debe ser mayor que 0'),
  categoryId: z.string(),
  alertThresholdPct: z.number().int().min(1).max(100),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
