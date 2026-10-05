import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { formatMoney } from '@/shared/lib/money';
import type { Income } from '../domain/income';
import { useDeleteIncome } from '../hooks/use-incomes';

export function IncomeList({ incomes }: { incomes: Income[] }) {
  const { user } = useAuth();
  const deleteIncome = useDeleteIncome();

  return (
    <ul className="divide-y">
      {incomes.map((income) => (
        <li key={income.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{income.title}</p>
            <p className="text-sm text-muted-foreground">
              {income.category?.name ?? 'Sin categoría'} ·{' '}
              {new Date(income.date).toLocaleDateString('es')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-semibold">
              {formatMoney(income.amountMinorUnits, user?.currency)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteIncome.mutate(income.id)}
              aria-label="Eliminar ingreso"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
