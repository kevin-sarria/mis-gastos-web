import { Paperclip, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store/auth-context';
import { DEFAULT_CATEGORY_COLOR } from '@/features/categories/domain/category-colors';
import { useDeleteAttachment, useUploadAttachment } from '@/features/files/hooks/use-files';
import { formatMoney } from '@/shared/lib/money';
import { EXPENSE_TAG_LABELS } from '../domain/expense';
import type { Expense } from '../domain/expense';
import { useDeleteExpense } from '../hooks/use-expenses';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onEdit }: ExpenseListProps) {
  const { user } = useAuth();
  const deleteExpense = useDeleteExpense();
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

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

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {expense.attachments.map((attachment) => (
                  <span key={attachment.id} className="relative inline-flex">
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.mimeType.startsWith('image/') ? (
                        <img
                          src={attachment.url}
                          alt={attachment.filename}
                          className="h-12 w-12 rounded border object-cover"
                        />
                      ) : (
                        <Badge variant="outline">Ver factura</Badge>
                      )}
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteAttachment.mutate(attachment.id)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white"
                      aria-label="Quitar factura"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                  Añadir factura
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(event) => {
                      const selected = event.target.files?.[0];
                      if (selected) {
                        uploadAttachment.mutate({ expenseId: expense.id, file: selected });
                      }
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span className="mr-1 font-semibold">
                {formatMoney(expense.amountMinorUnits, user?.currency)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(expense)}
                aria-label="Editar gasto"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
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
