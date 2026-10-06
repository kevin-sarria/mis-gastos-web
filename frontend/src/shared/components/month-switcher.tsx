import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  currentMonthKey,
  shiftMonthKey,
  useSelectedMonth,
} from '@/shared/hooks/use-selected-month';

function labelFor(monthKey: string): string {
  const [yearPart, monthPart] = monthKey.split('-');
  const date = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MonthSwitcher() {
  const { month, setMonth } = useSelectedMonth();
  const atCurrentMonth = month >= currentMonthKey();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMonth(shiftMonthKey(month, -1))}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-40 text-center text-sm font-medium">{labelFor(month)}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMonth(shiftMonthKey(month, 1))}
        disabled={atCurrentMonth}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!atCurrentMonth ? (
        <Button variant="ghost" size="sm" onClick={() => setMonth(currentMonthKey())}>
          Mes actual
        </Button>
      ) : null}
    </div>
  );
}
