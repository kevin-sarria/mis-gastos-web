import { Wallet } from 'lucide-react';
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
import { IncomeForm } from '../components/income-form';
import { IncomeList } from '../components/income-list';
import type { Income } from '../domain/income';
import { useIncomes } from '../hooks/use-incomes';

export function IncomesPage() {
  const { t } = useTranslation();
  const { data: incomes = [], isLoading } = useIncomes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);

  const openEdit = (income: Income) => {
    setEditing(income);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.incomes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.incomes.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>Nuevo ingreso</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
                <DialogDescription>
                  {editing
                    ? 'Corrige los datos del ingreso.'
                    : 'Registra una entrada de dinero de este mes.'}
                </DialogDescription>
              </DialogHeader>
              <IncomeForm
                income={editing ?? undefined}
                onDone={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : incomes.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin ingresos este mes"
          description="Registra tu primer ingreso del mes para ver tu balance."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ingresos del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeList incomes={incomes} onEdit={openEdit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
