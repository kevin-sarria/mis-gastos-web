import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { DEFAULT_CATEGORY_COLOR } from '@/features/categories/domain/category-colors';
import { formatDate, formatMoneyLocale } from '@/shared/lib/format';
import type { Income } from '../domain/income';
import { useDeleteIncome } from '../hooks/use-incomes';

interface IncomeListProps {
  incomes: Income[];
  onEdit?: (income: Income) => void;
}

export function IncomeList({ incomes, onEdit }: IncomeListProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const deleteIncome = useDeleteIncome();

  return (
    <ul className="divide-y">
      {incomes.map((income) => (
        <li
          key={income.id}
          className="flex items-center justify-between gap-3 border-l-2 py-3 pl-3"
          style={{ borderLeftColor: income.category?.color ?? DEFAULT_CATEGORY_COLOR }}
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{income.title}</p>
            <p className="text-sm text-muted-foreground">
              {income.category?.name ?? t('common.noCategory')} · {formatDate(income.date)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-1 font-semibold">
              {formatMoneyLocale(income.amountMinorUnits, user?.currency)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(income)}
              aria-label={t('incomes.editLabel')}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteIncome.mutate(income.id)}
              aria-label={t('incomes.deleteLabel')}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
