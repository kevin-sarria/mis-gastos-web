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

export function formatMoneyInput(rawDigits: string, minorUnits: number): string {
  const digits = rawDigits.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (digits === '') {
    return '';
  }

  const padded = digits.padStart(minorUnits + 1, '0');
  const integerPart = minorUnits > 0 ? padded.slice(0, -minorUnits) : padded;
  const decimalPart = minorUnits > 0 ? padded.slice(-minorUnits) : '';
  const integerFormatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return minorUnits > 0 ? `${integerFormatted},${decimalPart}` : integerFormatted;
}
