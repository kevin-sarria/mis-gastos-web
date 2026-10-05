import { z } from 'zod';

export const incomeFormSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría'),
  title: z.string().trim().min(1, 'Escribe un título').max(120),
  amount: z.string().regex(/^\d+([.,]\d+)?$/, 'Monto inválido'),
  frequency: z.enum(['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  date: z.string().min(1, 'Indica la fecha'),
  note: z.string().trim().max(500).optional(),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
