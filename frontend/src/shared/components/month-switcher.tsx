import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { currentLocale } from '@/shared/i18n';
import {
  currentMonthKey,
  shiftMonthKey,
  useSelectedMonth,
} from '@/shared/hooks/use-selected-month';

function labelFor(monthKey: string, locale: string): string {
  const [yearPart, monthPart] = monthKey.split('-');
  const date = new Date(Number(yearPart), Number(monthPart) - 1, 1);
  const label = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MonthSwitcher() {
  const { t } = useTranslation();
  const { month, setMonth } = useSelectedMonth();
  const atCurrentMonth = month >= currentMonthKey();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMonth(shiftMonthKey(month, -1))}
        aria-label={t('month.previous')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-40 text-center text-sm font-medium">
        {labelFor(month, currentLocale())}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMonth(shiftMonthKey(month, 1))}
        disabled={atCurrentMonth}
        aria-label={t('month.next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {!atCurrentMonth ? (
        <Button variant="ghost" size="sm" onClick={() => setMonth(currentMonthKey())}>
          {t('month.current')}
        </Button>
      ) : null}
    </div>
  );
}
