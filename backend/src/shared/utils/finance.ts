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

export function parseMonthKey(monthKey: string | undefined, now = new Date()): MonthRange {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return currentMonthRange(now);
  }

  const [yearPart, monthPart] = monthKey.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return currentMonthRange(now);
  }

  return monthRange(year, month);
}

export function monthRangeFromQuery(value: unknown): MonthRange {
  return parseMonthKey(typeof value === 'string' ? value : undefined);
}

export function previousMonthOf(range: MonthRange): MonthRange {
  return monthRange(range.start.getFullYear(), range.start.getMonth());
}

export function formatMonthKey(range: MonthRange): string {
  return `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`;
}

export function isWithinRange(date: Date, range: MonthRange): boolean {
  return date >= range.start && date < range.end;
}

export function sumAmounts(items: { amountMinorUnits: number }[]): number {
  return items.reduce((sum, item) => sum + item.amountMinorUnits, 0);
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
