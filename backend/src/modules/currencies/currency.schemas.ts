import { z } from 'zod';

export const currencyCreateSchema = z.object({
  code: z.string().trim().toUpperCase().length(3),
  name: z.string().trim().min(2).max(80),
  symbol: z.string().trim().min(1).max(10),
  minorUnits: z.number().int().min(0).max(4),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const currencyUpdateSchema = currencyCreateSchema.partial();

export type CurrencyCreateInput = z.infer<typeof currencyCreateSchema>;
export type CurrencyUpdateInput = z.infer<typeof currencyUpdateSchema>;
