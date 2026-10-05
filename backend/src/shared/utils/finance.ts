export type IncomeFrequency = 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface MonthRange {
  start: Date;
  end: Date; // exclusivo
}

export function monthRange(year: number, month: number): MonthRange {
  return { start: new Date(year, month - 1, 1), end: new Date(year, month, 1) };
}

export function currentMonthRange(now = new Date()): MonthRange {
  return monthRange(now.getFullYear(), now.getMonth() + 1);
}

export function previousMonthRange(now = new Date()): MonthRange {
  return monthRange(now.getFullYear(), now.getMonth());
}

export function sumAmounts(items: { amountMinorUnits: number }[]): number {
  return items.reduce((sum, item) => sum + item.amountMinorUnits, 0);
}

export function isRecurringIncomeActiveInMonth(
  frequency: IncomeFrequency,
  date: Date,
  range: MonthRange,
): boolean {
  switch (frequency) {
    case 'ONE_TIME':
      return date >= range.start && date < range.end;
    case 'YEARLY':
      return date.getMonth() === range.start.getMonth() && date <= range.end;
    default:
      return date < range.end;
  }
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  total: number;
}

export function groupByCategory(
  expenses: { categoryId: string; categoryName: string; amountMinorUnits: number }[],
): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();

  for (const expense of expenses) {
    const existing = map.get(expense.categoryId);
    if (existing) {
      existing.total += expense.amountMinorUnits;
    } else {
      map.set(expense.categoryId, {
        categoryId: expense.categoryId,
        name: expense.categoryName,
        total: expense.amountMinorUnits,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}
