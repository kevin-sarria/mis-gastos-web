import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { DEFAULT_CATEGORY_COLOR } from '@/features/categories/domain/category-colors';
import { formatMoney } from '@/shared/lib/money';
import { EXPENSE_TAG_LABELS } from '../domain/expense';
import type { Expense } from '../domain/expense';
import { useDeleteExpense } from '../hooks/use-expenses';

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { user } = useAuth();
  const deleteExpense = useDeleteExpense();

  return (
    <ul className="divide-y">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="border-l-2 py-3 pl-3"
          style={{ borderLeftColor: expense.category?.color ?? DEFAULT_CATEGORY_COLOR }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{expense.title}</p>
              <p className="text-sm text-muted-foreground">
                {expense.category?.name ?? 'Sin categoría'} ·{' '}
                {new Date(expense.date).toLocaleDateString('es')}
              </p>
              {expense.tags.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {expense.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {EXPENSE_TAG_LABELS[tag]}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {expense.attachments.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {expense.attachments.map((attachment) => (
                    <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.mimeType.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="h-10 w-10 rounded border object-cover"
                        />
                      ) : (
                        <Badge variant="outline">Factura</Badge>
                      )}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-semibold">
                {formatMoney(expense.amountMinorUnits, user?.currency)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteExpense.mutate(expense.id)}
                aria-label="Eliminar gasto"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
