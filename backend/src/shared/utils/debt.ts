/**
 * Motor de cálculo de deudas.
 *
 * Convenciones:
 * - Los importes van en unidades menores (enteros) de la moneda del usuario.
 * - Las tasas van en "microporcentaje": 1% = 10_000, 2,5% = 25_000,
 *   1,2345% = 12_345. Es decir, tasa decimal = micro / 1_000_000.
 * - El sistema de amortización es el francés (cuota fija), que es el que
 *   usan los bancos: cada mes se paga lo mismo, y la parte de interés baja
 *   mientras la de capital sube.
 */

export const MICRO = 1_000_000;
const MAX_MONTHS = 600;

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
  months: number;
  /** Tasa efectiva anual en microporcentaje, derivada de la TEM. */
  teaMicro: number;
  schedule: ScheduleRow[];
}

function rateOf(monthlyRateMicro: number): number {
  return monthlyRateMicro / MICRO;
}

/** TEM -> TEA: (1 + i)^12 - 1 */
export function teaFromTem(monthlyRateMicro: number): number {
  return Math.round(((1 + rateOf(monthlyRateMicro)) ** 12 - 1) * MICRO);
}

/** Cuota fija del sistema francés: P * i / (1 - (1 + i)^-n) */
export function monthlyPayment(
  balanceMinorUnits: number,
  monthlyRateMicro: number,
  months: number,
): number {
  if (months <= 0) {
    return balanceMinorUnits;
  }
  const rate = rateOf(monthlyRateMicro);
  if (rate <= 0) {
    return Math.round(balanceMinorUnits / months);
  }
  const factor = (1 + rate) ** months;
  return Math.round((balanceMinorUnits * rate * factor) / (factor - 1));
}

/**
 * Meses necesarios para liquidar pagando siempre lo mismo.
 * Devuelve Infinity si la cuota no cubre ni los intereses (deuda impagable).
 */
export function monthsToPayoff(
  balanceMinorUnits: number,
  monthlyRateMicro: number,
  paymentMinorUnits: number,
): number {
  const rate = rateOf(monthlyRateMicro);
  if (paymentMinorUnits <= balanceMinorUnits * rate) {
    return Number.POSITIVE_INFINITY;
  }
  if (rate <= 0) {
    return Math.ceil(balanceMinorUnits / paymentMinorUnits);
  }
  return Math.ceil(
    -Math.log(1 - (balanceMinorUnits * rate) / paymentMinorUnits) / Math.log(1 + rate),
  );
}

/** Tabla de amortización mes a mes. La última cuota se ajusta al saldo exacto. */
export function buildSchedule(
  balanceMinorUnits: number,
  monthlyRateMicro: number,
  paymentMinorUnits: number,
  maxMonths = MAX_MONTHS,
): ScheduleRow[] {
  const rate = rateOf(monthlyRateMicro);
  const rows: ScheduleRow[] = [];
  let balance = balanceMinorUnits;

  for (let period = 1; period <= maxMonths && balance > 0; period += 1) {
    const interest = Math.round(balance * rate);
    let principal = paymentMinorUnits - interest;
    let payment = paymentMinorUnits;

    if (principal <= 0) {
      break; // la cuota no cubre los intereses: nunca se liquida
    }
    if (principal >= balance) {
      principal = balance;
      payment = principal + interest;
    }

    balance -= principal;
    rows.push({
      period,
      paymentMinorUnits: payment,
      interestMinorUnits: interest,
      principalMinorUnits: principal,
      balanceMinorUnits: balance,
    });
  }

  return rows;
}

export function summarize(schedule: ScheduleRow[], monthlyRateMicro: number): SimulationResult {
  const totalInterestMinorUnits = schedule.reduce((sum, row) => sum + row.interestMinorUnits, 0);
  const totalPaidMinorUnits = schedule.reduce((sum, row) => sum + row.paymentMinorUnits, 0);
  return {
    monthlyPaymentMinorUnits: schedule[0]?.paymentMinorUnits ?? 0,
    totalInterestMinorUnits,
    totalPaidMinorUnits,
    months: schedule.length,
    teaMicro: teaFromTem(monthlyRateMicro),
    schedule,
  };
}

/** Simula una deuda con cuota fija derivada del plazo. */
export function simulateByTerm(
  amountMinorUnits: number,
  monthlyRateMicro: number,
  months: number,
): SimulationResult {
  const payment = monthlyPayment(amountMinorUnits, monthlyRateMicro, months);
  return summarize(buildSchedule(amountMinorUnits, monthlyRateMicro, payment), monthlyRateMicro);
}

/**
 * Simula una deuda pagando una cuota concreta (el caso de las tarjetas:
 * "pago mínimo"). Devuelve Infinity en months si nunca se liquida.
 */
export function simulateByPayment(
  amountMinorUnits: number,
  monthlyRateMicro: number,
  paymentMinorUnits: number,
): SimulationResult {
  const schedule = buildSchedule(amountMinorUnits, monthlyRateMicro, paymentMinorUnits);
  const result = summarize(schedule, monthlyRateMicro);
  const liquidated = schedule.length > 0 && schedule[schedule.length - 1]?.balanceMinorUnits === 0;
  return { ...result, months: liquidated ? result.months : Number.POSITIVE_INFINITY };
}

// ============================================================
// Plan de liquidación (avalancha vs bola de nieve)
// ============================================================

export type PayoffStrategy = 'AVALANCHE' | 'SNOWBALL';

export interface PayoffDebtInput {
  id: string;
  name: string;
  balanceMinorUnits: number;
  monthlyRateMicro: number;
  installmentMinorUnits: number;
}

export interface PayoffOrderEntry {
  id: string;
  name: string;
  monthPaidOff: number;
}

export interface PayoffMonth {
  period: number;
  totalPaymentMinorUnits: number;
  totalInterestMinorUnits: number;
  totalBalanceMinorUnits: number;
}

export interface PayoffResult {
  strategy: PayoffStrategy;
  months: number;
  totalInterestMinorUnits: number;
  totalPaidMinorUnits: number;
  payoffOrder: PayoffOrderEntry[];
  schedule: PayoffMonth[];
}

interface DebtState {
  id: string;
  name: string;
  rate: number;
  balance: number;
  minimum: number;
  paidOffAt: number;
}

/**
 * Simula mes a mes el pago de todas las deudas.
 *
 * Se pagan todas las cuotas mínimas y el excedente (aporte extra) se lanza
 * contra la deuda prioritaria:
 * - AVALANCHE: primero la de mayor interés (matemáticamente la más barata).
 * - SNOWBALL: primero la de menor saldo (se ve progreso antes).
 */
export function simulatePayoff(
  debts: PayoffDebtInput[],
  extraMonthlyMinorUnits: number,
  strategy: PayoffStrategy,
): PayoffResult {
  const state: DebtState[] = debts.map((debt) => ({
    id: debt.id,
    name: debt.name,
    rate: rateOf(debt.monthlyRateMicro),
    balance: debt.balanceMinorUnits,
    minimum: debt.installmentMinorUnits,
    paidOffAt: 0,
  }));

  const payoffOrder: PayoffOrderEntry[] = [];
  const schedule: PayoffMonth[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (state.some((debt) => debt.balance > 0) && month < MAX_MONTHS) {
    month += 1;

    // 1. Intereses del mes
    let monthInterest = 0;
    for (const debt of state) {
      if (debt.balance <= 0) continue;
      const interest = Math.round(debt.balance * debt.rate);
      debt.balance += interest;
      monthInterest += interest;
    }

    // 2. Presupuesto disponible: cuotas mínimas + aporte extra
    const alive = state.filter((debt) => debt.balance > 0);
    let budget = alive.reduce((sum, debt) => sum + debt.minimum, 0) + extraMonthlyMinorUnits;
    let monthPaid = 0;

    // 3. Cuotas mínimas
    for (const debt of state) {
      if (debt.balance <= 0) continue;
      const pay = Math.min(debt.minimum, debt.balance);
      debt.balance -= pay;
      budget -= pay;
      monthPaid += pay;
    }

    // 4. El excedente va a la deuda prioritaria, y de ahí a la siguiente
    const priority = state
      .filter((debt) => debt.balance > 0)
      .sort((a, b) =>
        strategy === 'AVALANCHE'
          ? b.rate - a.rate || a.balance - b.balance
          : a.balance - b.balance || b.rate - a.rate,
      );

    for (const debt of priority) {
      if (budget <= 0) break;
      const pay = Math.min(budget, debt.balance);
      debt.balance -= pay;
      budget -= pay;
      monthPaid += pay;
    }

    // 5. Registrar deudas liquidadas
    for (const debt of state) {
      if (debt.balance <= 0 && debt.paidOffAt === 0) {
        debt.paidOffAt = month;
        payoffOrder.push({ id: debt.id, name: debt.name, monthPaidOff: month });
      }
    }

    totalInterest += monthInterest;
    totalPaid += monthPaid;
    schedule.push({
      period: month,
      totalPaymentMinorUnits: monthPaid,
      totalInterestMinorUnits: monthInterest,
      totalBalanceMinorUnits: state.reduce((sum, debt) => sum + Math.max(debt.balance, 0), 0),
    });
  }

  return {
    strategy,
    months: month,
    totalInterestMinorUnits: totalInterest,
    totalPaidMinorUnits: totalPaid,
    payoffOrder,
    schedule,
  };
}

/** TEM media ponderada por saldo: el "interés real" de tu bola de deudas. */
export function weightedAverageRate(debts: PayoffDebtInput[]): number {
  const total = debts.reduce((sum, debt) => sum + debt.balanceMinorUnits, 0);
  if (total <= 0) {
    return 0;
  }
  const weighted = debts.reduce(
    (sum, debt) => sum + debt.balanceMinorUnits * debt.monthlyRateMicro,
    0,
  );
  return Math.round(weighted / total);
}
