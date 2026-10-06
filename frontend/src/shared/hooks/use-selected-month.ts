import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [yearPart, monthPart] = monthKey.split('-');
  const date = new Date(Number(yearPart), Number(monthPart) - 1 + delta, 1);
  return currentMonthKey(date);
}

export function useSelectedMonth() {
  const [params, setParams] = useSearchParams();
  const month = params.get('mes') ?? currentMonthKey();

  const setMonth = useCallback(
    (next: string) => {
      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set('mes', next);
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { month, setMonth };
}
