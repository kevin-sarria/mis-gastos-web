import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { DEFAULT_CATEGORY_COLOR } from '@/features/categories/domain/category-colors';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/shared/lib/money';
import type { Budget } from '../domain/budget';
import { useDeleteBudget } from '../hooks/use-budgets';

export function BudgetList({ budgets }: { budgets: Budget[] }) {
  const { user } = useAuth();
  const deleteBudget = useDeleteBudget();

  return (
    <ul className="divide-y">
      {budgets.map((budget) => {
        const ratio =
          budget.amountMinorUnits > 0 ? budget.spentMinorUnits / budget.amountMinorUnits : 0;
        const percent = Math.min(Math.round(ratio * 100), 100);
        const exceeded = ratio >= 1;
        const near = !exceeded && ratio >= budget.alertThresholdPct / 100;

        return (
          <li
            key={budget.id}
            className="space-y-2 border-l-2 py-3 pl-3"
            style={{ borderLeftColor: budget.category?.color ?? DEFAULT_CATEGORY_COLOR }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{budget.name}</p>
                <p className="text-sm text-muted-foreground">
                  {budget.category?.name ?? 'Global'} · alerta al {budget.alertThresholdPct}%
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-semibold">
                  {formatMoney(budget.spentMinorUnits, user?.currency)} /{' '}
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
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  exceeded ? 'bg-destructive' : near ? 'bg-amber-500' : 'bg-primary',
                )}
                style={{ width: `${percent}%` }}
              />
            </div>

            <p
              className={cn(
                'text-xs',
                exceeded ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {exceeded ? 'Presupuesto superado' : `${percent}% usado`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
