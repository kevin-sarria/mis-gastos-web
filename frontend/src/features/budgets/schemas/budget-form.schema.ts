import { z } from 'zod';

type TranslateFn = (key: string) => string;

export const createBudgetFormSchema = (t: TranslateFn) =>
  z.object({
    name: z.string().trim().min(1, t('validation.required')).max(120),
    amount: z
      .string()
      .min(1, t('validation.required'))
      .regex(/^\d+$/, t('validation.amountInvalid'))
      .refine((value) => Number(value) > 0, t('validation.amountPositive')),
    categoryId: z.string(),
    alertThresholdPct: z
      .number()
      .int()
      .min(1, t('validation.percentageRange'))
      .max(100, t('validation.percentageRange')),
  });

export type BudgetFormValues = z.infer<ReturnType<typeof createBudgetFormSchema>>;
