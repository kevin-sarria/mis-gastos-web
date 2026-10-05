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
import { IncomeForm } from '../components/income-form';
import { IncomeList } from '../components/income-list';
import { useIncomes } from '../hooks/use-incomes';

export function IncomesPage() {
  const { t } = useTranslation();
  const { data: incomes = [], isLoading } = useIncomes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.incomes.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.incomes.description')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nuevo ingreso</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo ingreso</DialogTitle>
              <DialogDescription>Registra una entrada de dinero.</DialogDescription>
            </DialogHeader>
            <IncomeForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : incomes.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Aún no hay ingresos"
          description="Registra tu primer ingreso para empezar a ver tu balance."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeList incomes={incomes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
