import { z } from 'zod';

type TranslateFn = (key: string) => string;

export const createLoginSchema = (t: TranslateFn) =>
  z.object({
    email: z.string().trim().toLowerCase().email(t('validation.email')),
    password: z.string().min(1, t('validation.required')),
  });

export const createRegisterSchema = (t: TranslateFn) =>
  z
    .object({
      name: z.string().trim().min(2, t('validation.min2')).max(80),
      email: z.string().trim().toLowerCase().email(t('validation.email')),
      password: z.string().min(8, t('validation.min8')).max(128),
      confirmPassword: z.string(),
      currencyCode: z.string().min(1, t('validation.chooseCurrency')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

export const createForgotPasswordSchema = (t: TranslateFn) =>
  z.object({
    email: z.string().trim().toLowerCase().email(t('validation.email')),
  });

export const createResetPasswordSchema = (t: TranslateFn) =>
  z
    .object({
      password: z.string().min(8, t('validation.min8')).max(128),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof createForgotPasswordSchema>>;
export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
