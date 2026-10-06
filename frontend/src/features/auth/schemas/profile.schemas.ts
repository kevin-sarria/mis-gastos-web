import { z } from 'zod';

type TranslateFn = (key: string) => string;

export const createProfileSchema = (t: TranslateFn) =>
  z.object({
    name: z.string().trim().min(2, t('validation.min2')).max(80),
    currencyCode: z.string().min(1, t('validation.chooseCurrency')),
  });

export const createPasswordChangeSchema = (t: TranslateFn) =>
  z
    .object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z.string().min(8, t('validation.min8')).max(128),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;
export type PasswordChangeFormValues = z.infer<ReturnType<typeof createPasswordChangeSchema>>;
