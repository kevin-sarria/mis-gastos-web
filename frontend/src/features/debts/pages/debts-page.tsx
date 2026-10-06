import { HandCoins } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { cn } from '@/lib/utils';
import { formatMoneyLocale } from '@/shared/lib/format';
import { DebtForm } from '../components/debt-form';
import { DebtList } from '../components/debt-list';
import { DebtSimulator } from '../components/debt-simulator';
import { PayoffPlanView } from '../components/payoff-plan';
import { formatRate } from '../domain/debt';
import type { Debt } from '../domain/debt';
import { useDebts } from '../hooks/use-debts';
import { useAuth } from '@/features/auth/store/auth-context';

const TABS = ['list', 'simulator', 'plan'] as const;
type Tab = (typeof TABS)[number];

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="tabular text-lg font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function DebtsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useDebts();
  const [tab, setTab] = useState<Tab>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const currency = user?.currency;

  const openEdit = (debt: Debt) => {
    setEditing(debt);
    setDialogOpen(true);
  };

  const summary = data?.summary;
  const debts = data?.debts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('debts.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('debts.description')}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>{t('debts.new')}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t(editing ? 'debts.edit' : 'debts.new')}</DialogTitle>
              <DialogDescription>{t('debts.form.rateHint')}</DialogDescription>
            </DialogHeader>
            <DebtForm debt={editing ?? undefined} onDone={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              tab === item
                ? 'bg-card font-medium shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`debts.tabs.${item}`)}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        isLoading || !summary ? (
          <p className="text-muted-foreground">{t('common.loading')}</p>
        ) : debts.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title={t('debts.emptyTitle')}
            description={t('debts.emptyDescription')}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label={t('debts.totalBalance')}
                value={formatMoneyLocale(summary.totalBalanceMinorUnits, currency)}
              />
              <SummaryCard
                label={t('debts.monthlyPayment')}
                value={formatMoneyLocale(summary.totalMonthlyPaymentMinorUnits, currency)}
              />
              <SummaryCard
                label={t('debts.avgRate')}
                value={formatRate(summary.weightedAverageRateMicro)}
              />
              <SummaryCard
                label={t('debts.interestIfMinimum')}
                value={formatMoneyLocale(summary.totalInterestIfMinimumMinorUnits, currency)}
              />
            </div>

            <DebtList debts={debts} onEdit={openEdit} />
          </div>
        )
      ) : null}

      {tab === 'simulator' ? <DebtSimulator /> : null}
      {tab === 'plan' ? <PayoffPlanView /> : null}
    </div>
  );
}
