import { z } from 'zod';

export const expenseFormSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría'),
  title: z.string().trim().min(1, 'Escribe un título').max(120),
  amount: z.string().regex(/^\d+([.,]\d+)?$/, 'Monto inválido'),
  date: z.string().min(1, 'Indica la fecha'),
  tags: z.array(z.enum(['FIXED', 'VARIABLE', 'EMERGENCY', 'ANT_EXPENSE'])),
  justification: z.string().trim().max(2000).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
