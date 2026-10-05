import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { formatMoneyInput } from '@/shared/lib/money';

interface CurrencyInputProps
  extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value: string;
  onValueChange: (rawDigits: string) => void;
  minorUnits: number;
}

export function CurrencyInput({
  value,
  onValueChange,
  minorUnits,
  ...props
}: CurrencyInputProps) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatMoneyInput(value, minorUnits)}
      onChange={(event) => onValueChange(event.target.value.replace(/\D/g, ''))}
    />
  );
}
