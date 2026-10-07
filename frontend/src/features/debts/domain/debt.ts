export type LenderType = 'BANK' | 'CREDIT_CARD' | 'STORE' | 'INFORMAL' | 'FAMILY' | 'OTHER';
export type DebtStatus = 'ACTIVE' | 'PAID' | 'DEFAULTED';
export type PayoffStrategy = 'AVALANCHE' | 'SNOWBALL';

export interface DebtAnalysis {
  liquidated: boolean;
  monthsToPayoff: number | null;
  totalInterestMinorUnits: number;
  totalPaidMinorUnits: number;
  firstPaymentInterestMinorUnits: number;
}

export interface Debt {
  id: string;
  name: string;
  lenderType: LenderType;
  lenderName: string | null;
  principalMinorUnits: number | null;
  balanceMinorUnits: number;
  monthlyRateMicro: number;
  installmentMinorUnits: number;
  remainingMonths: number | null;
  paymentDay: number | null;
  isSinglePayment: boolean;
  dueDate: string | null;
  startDate: string;
  notes: string | null;
  status: DebtStatus;
  analysis: DebtAnalysis;
  teaMicro: number;
}

export interface DebtSummary {
  activeCount: number;
  totalBalanceMinorUnits: number;
  totalMonthlyPaymentMinorUnits: number;
  weightedAverageRateMicro: number;
  totalInterestIfMinimumMinorUnits: number;
}

export interface DebtsData {
  debts: Debt[];
  summary: DebtSummary;
}

export interface DebtCreateInput {
  name: string;
  lenderType: LenderType;
  lenderName: string | null;
  principalMinorUnits: number | null;
  balanceMinorUnits: number;
  monthlyRateMicro: number;
  installmentMinorUnits: number;
  remainingMonths: number | null;
  paymentDay: number | null;
  isSinglePayment: boolean;
  dueDate: string | null;
  startDate: string;
  notes: string | null;
  status: DebtStatus;
}

export interface ScheduleRow {
  period: number;
  paymentMinorUnits: number;
  interestMinorUnits: number;
  principalMinorUnits: number;
  balanceMinorUnits: number;
}

export interface SimulationResult {
  monthlyPaymentMinorUnits: number;
  totalInterestMinorUnits: number;
  totalPaidMinorUnits: number;
  months: number | null;
  viable: boolean;
  teaMicro: number;
  firstPaymentInterestSharePct: number;
  interestOverPrincipalPct: number;
  schedule: ScheduleRow[];
}

export interface PayoffOrderEntry {
  id: string;
  name: string;
  monthPaidOff: number;
}

export interface PayoffResult {
  strategy: PayoffStrategy;
  months: number;
  totalInterestMinorUnits: number;
  totalPaidMinorUnits: number;
  payoffOrder: PayoffOrderEntry[];
  schedule: { period: number; totalPaymentMinorUnits: number; totalInterestMinorUnits: number; totalBalanceMinorUnits: number }[];
}

export interface PayoffPlanDebt {
  id: string;
  name: string;
  balanceMinorUnits: number;
  monthlyRateMicro: number;
  installmentMinorUnits: number;
}

export interface PayoffPlan {
  debts: PayoffPlanDebt[];
  extraMonthlyMinorUnits: number;
  totalBalanceMinorUnits: number;
  totalMonthlyPaymentMinorUnits: number;
  weightedAverageRateMicro: number;
  plans: {
    minimumsOnly: PayoffResult;
    avalanche: PayoffResult;
    snowball: PayoffResult;
  };
  savingsVsMinimumsMinorUnits: number;
  monthsSavedVsMinimums: number;
}

/** La tasa viaja en microporcentaje: 1% = 10.000. */
export function microToPercent(micro: number): number {
  return micro / 10_000;
}

export function percentToMicro(percent: number): number {
  return Math.round(percent * 10_000);
}

/** "%" que se muestra en la lista de deudas (sin decimales si es redonda). */
export function formatRate(micro: number): string {
  const percent = microToPercent(micro);
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2)}%`;
}

/**
 * Lo que una deuda te cobra de intereses en un mes.
 * Es LA cifra que explica por qué conviene atacar primero la más cara.
 */
export function monthlyInterestMinorUnits(balanceMinorUnits: number, rateMicro: number): number {
  return Math.round((balanceMinorUnits * rateMicro) / 1_000_000);
}
