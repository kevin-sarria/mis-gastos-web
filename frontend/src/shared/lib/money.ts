export interface MoneyCurrency {
  symbol: string;
  minorUnits: number;
}

export function formatMoney(
  minorUnits: number,
  currency: MoneyCurrency | null | undefined,
): string {
  const decimals = currency?.minorUnits ?? 2;
  const symbol = currency?.symbol ?? '';
  const value = minorUnits / 10 ** decimals;
  const formatted = value.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol} ${formatted}`.trim();
}

export function parseAmountToMinorUnits(input: string, minorUnits: number): number {
  const normalized = input.trim().replace(',', '.');
  const [majorPart = '0', fractionPart = ''] = normalized.split('.');
  const major = Number.parseInt(majorPart, 10);
  const fraction = fractionPart.padEnd(minorUnits, '0').slice(0, minorUnits);

  return (
    (Number.isNaN(major) ? 0 : major) * 10 ** minorUnits +
    (Number.parseInt(fraction || '0', 10) || 0)
  );
}
