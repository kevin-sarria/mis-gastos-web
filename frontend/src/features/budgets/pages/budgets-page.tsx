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
          <h1 className="text-2xl font-semibold tracking-tight">{t('budgets.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('budgets.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t('budgets.new')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('budgets.new')}</DialogTitle>
                <DialogDescription>{t('budgets.newDescription')}</DialogDescription>
              </DialogHeader>
              <BudgetForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title={t('budgets.emptyTitle')}
          description={t('budgets.emptyDescription')}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('budgets.listTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetList budgets={budgets} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
