import { z } from 'zod';

export const incomeFormSchema = z.object({
  categoryId: z.string().min(1, 'Elige una categoría'),
  title: z.string().trim().min(1, 'Escribe un título').max(120),
  amount: z
    .string()
    .min(1, 'Indica el monto')
    .regex(/^\d+$/, 'Monto inválido')
    .refine((value) => Number(value) > 0, 'El monto debe ser mayor que 0'),
  date: z.string().min(1, 'Indica la fecha'),
  note: z.string().trim().max(500).optional(),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
