import { currentLocale } from '@/shared/i18n';
import { formatMoney } from './money';
import type { MoneyCurrency } from './money';

export function formatMoneyLocale(
  minorUnits: number,
  currency: MoneyCurrency | null | undefined,
): string {
  return formatMoney(minorUnits, currency, currentLocale());
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(currentLocale());
}
