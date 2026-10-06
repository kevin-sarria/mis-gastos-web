import { z } from 'zod';

export const LENDER_TYPES = [
  'BANK',
  'CREDIT_CARD',
  'STORE',
  'INFORMAL',
  'FAMILY',
  'OTHER',
] as const;

export const DEBT_STATUSES = ['ACTIVE', 'PAID', 'DEFAULTED'] as const;

/** Tasa efectiva mensual en microporcentaje: 1% = 10_000, 2,5% = 25_000. */
const rateSchema = z.number().int().min(0).max(1_000_000);

export const debtCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  lenderType: z.enum(LENDER_TYPES).default('BANK'),
  lenderName: z.string().trim().max(120).nullish(),
  principalMinorUnits: z.number().int().nonnegative().nullish(),
  balanceMinorUnits: z.number().int().nonnegative(),
  monthlyRateMicro: rateSchema,
  installmentMinorUnits: z.number().int().positive(),
  remainingMonths: z.number().int().positive().max(600).nullish(),
  paymentDay: z.number().int().min(1).max(31).nullish(),
  startDate: z.coerce.date(),
  notes: z.string().trim().max(2000).nullish(),
  status: z.enum(DEBT_STATUSES).default('ACTIVE'),
});

export const debtUpdateSchema = debtCreateSchema.partial();

export const paymentCreateSchema = z.object({
  amountMinorUnits: z.number().int().positive(),
  date: z.coerce.date(),
  note: z.string().trim().max(500).nullish(),
});

export const simulatorSchema = z
  .object({
    amountMinorUnits: z.number().int().positive(),
    monthlyRateMicro: rateSchema,
    months: z.number().int().positive().max(600).optional(),
    paymentMinorUnits: z.number().int().positive().optional(),
  })
  .refine((data) => Boolean(data.months) || Boolean(data.paymentMinorUnits), {
    message: 'Indica el plazo en meses o la cuota mensual',
    path: ['months'],
  });

export const payoffPlanSchema = z.object({
  extraMonthlyMinorUnits: z.number().int().nonnegative().default(0),
});

export const PLAN_STRATEGIES = ['AVALANCHE', 'SNOWBALL'] as const;

export const planSaveSchema = z.object({
  strategy: z.enum(PLAN_STRATEGIES),
  extraMonthlyMinorUnits: z.number().int().nonnegative(),
});

export type PlanSaveInput = z.infer<typeof planSaveSchema>;

export type DebtCreateInput = z.infer<typeof debtCreateSchema>;
export type DebtUpdateInput = z.infer<typeof debtUpdateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type SimulatorInput = z.infer<typeof simulatorSchema>;
export type PayoffPlanInput = z.infer<typeof payoffPlanSchema>;
