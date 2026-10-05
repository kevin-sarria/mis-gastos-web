import { Receipt } from 'lucide-react';
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
import { ExpenseForm } from '../components/expense-form';
import { ExpenseList } from '../components/expense-list';
import { useExpenses } from '../hooks/use-expenses';

export function ExpensesPage() {
  const { t } = useTranslation();
  const { data: expenses = [], isLoading } = useExpenses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.expenses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.expenses.description')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nuevo gasto</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo gasto</DialogTitle>
              <DialogDescription>Anota un gasto y adjunta su factura.</DialogDescription>
            </DialogHeader>
            <ExpenseForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aún no hay gastos"
          description="Registra tu primer gasto para empezar a controlar tus finanzas."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
