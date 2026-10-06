import { z } from 'zod';

type TranslateFn = (key: string) => string;

export const createIncomeFormSchema = (t: TranslateFn) =>
  z.object({
    categoryId: z.string().min(1, t('validation.chooseCategory')),
    title: z.string().trim().min(1, t('validation.required')).max(120),
    amount: z
      .string()
      .min(1, t('validation.required'))
      .regex(/^\d+$/, t('validation.amountInvalid'))
      .refine((value) => Number(value) > 0, t('validation.amountPositive')),
    date: z.string().min(1, t('validation.chooseDate')),
    note: z.string().trim().max(500).optional(),
  });

export type IncomeFormValues = z.infer<ReturnType<typeof createIncomeFormSchema>>;
