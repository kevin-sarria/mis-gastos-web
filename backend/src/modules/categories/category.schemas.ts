import { z } from 'zod';

export const categoryCreateSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  name: z.string().trim().min(2).max(60),
  color: z.string().trim().max(20).nullish(),
  icon: z.string().trim().max(40).nullish(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
