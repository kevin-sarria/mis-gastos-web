import { Wallet } from 'lucide-react';
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
import { useIncomes } from '../hooks/use-incomes';

export function IncomesPage() {
  const { t } = useTranslation();
  const { data: incomes = [], isLoading } = useIncomes();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.incomes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.incomes.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher />
          <Dialog>
            <DialogTrigger asChild>
              <Button>Nuevo ingreso</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo ingreso</DialogTitle>
                <DialogDescription>Registra una entrada de dinero de este mes.</DialogDescription>
              </DialogHeader>
              <IncomeForm />
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
            <IncomeList incomes={incomes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
