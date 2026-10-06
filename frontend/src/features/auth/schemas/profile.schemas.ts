import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80),
  currencyCode: z.string().min(1, 'Elige una moneda'),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Escribe tu contraseña actual'),
    newPassword: z.string().min(8, 'Mínimo 8 caracteres').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
