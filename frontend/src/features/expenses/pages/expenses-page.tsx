import { Receipt } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { MonthSwitcher } from '@/shared/components/month-switcher';
import { ExpenseForm } from '../components/expense-form';
import { ExpenseList } from '../components/expense-list';
import type { Expense } from '../domain/expense';
import { useExpenses } from '../hooks/use-expenses';

export function ExpensesPage() {
  const { t } = useTranslation();
  const { data: expenses = [], isLoading } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('expenses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('expenses.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>{t('expenses.new')}</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t(editing ? 'expenses.edit' : 'expenses.new')}</DialogTitle>
                <DialogDescription>
                  {t(editing ? 'expenses.editDescription' : 'expenses.newDescription')}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm expense={editing ?? undefined} onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t('expenses.emptyTitle')}
          description={t('expenses.emptyDescription')}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('expenses.listTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} onEdit={openEdit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
