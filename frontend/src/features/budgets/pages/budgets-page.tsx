import { PiggyBank } from 'lucide-react';
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
import { BudgetForm } from '../components/budget-form';
import { BudgetList } from '../components/budget-list';
import { useBudgets } from '../hooks/use-budgets';

export function BudgetsPage() {
  const { t } = useTranslation();
  const { data: budgets = [], isLoading } = useBudgets();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.budgets.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.budgets.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Nuevo presupuesto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo presupuesto</DialogTitle>
                <DialogDescription>Define un límite por categoría o global.</DialogDescription>
              </DialogHeader>
              <BudgetForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Aún no hay presupuestos"
          description="Define límites por categoría para ver cuánto llevas gastado cada mes."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Presupuestos del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetList budgets={budgets} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
