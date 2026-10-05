import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { formatMoney } from '@/shared/lib/money';
import type { Budget } from '../domain/budget';
import { useDeleteBudget } from '../hooks/use-budgets';

export function BudgetList({ budgets }: { budgets: Budget[] }) {
  const { user } = useAuth();
  const deleteBudget = useDeleteBudget();

  return (
    <ul className="divide-y">
      {budgets.map((budget) => (
        <li key={budget.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{budget.name}</p>
            <p className="text-sm text-muted-foreground">
              {budget.category?.name ?? 'Global'} · Alerta al {budget.alertThresholdPct}%
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-semibold">
              {formatMoney(budget.amountMinorUnits, user?.currency)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteBudget.mutate(budget.id)}
              aria-label="Eliminar presupuesto"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
