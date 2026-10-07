import { AlertTriangle, Check, CircleDollarSign, Loader2, Target, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { CurrencyInput } from '@/shared/components/currency-input';
import { cn } from '@/lib/utils';
import { formatMoneyLocale } from '@/shared/lib/format';
import type { PayoffStrategy } from '../domain/plan';
import { useAddPayment } from '../hooks/use-debts';
import { useDebtPlan, useDeleteDebtPlan, useSaveDebtPlan } from '../hooks/use-debt-plan';

function StrategyPicker({
  value,
  onChange,
}: {
  value: PayoffStrategy;
  onChange: (value: PayoffStrategy) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(['AVALANCHE', 'SNOWBALL'] as PayoffStrategy[]).map((strategy) => (
        <button
          key={strategy}
          type="button"
          onClick={() => onChange(strategy)}
          className={cn(
            'rounded-lg border p-3 text-left text-sm transition-colors',
            value === strategy
              ? 'border-primary bg-primary/[0.07] font-medium'
              : 'border-border hover:bg-accent',
          )}
        >
          <span className="flex items-center gap-2">
            {strategy === 'AVALANCHE' ? (
              <Target className="h-4 w-4 text-primary" />
            ) : (
              <CircleDollarSign className="h-4 w-4 text-primary" />
            )}
            {t(`debts.plan.plan${strategy === 'AVALANCHE' ? 'Avalanche' : 'Snowball'}`)}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {t(`debts.plan.plan${strategy === 'AVALANCHE' ? 'Avalanche' : 'Snowball'}Hint`)}
          </span>
        </button>
      ))}
    </div>
  );
}

export function MonthlyPlanCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const currency = user?.currency;

  const { data: plan, isLoading } = useDebtPlan();
  const savePlan = useSaveDebtPlan();
  const deletePlan = useDeleteDebtPlan();
  const addPayment = useAddPayment();
  const { data: summary } = useDashboard();

  const [editing, setEditing] = useState(false);
  const [strategy, setStrategy] = useState<PayoffStrategy>('AVALANCHE');
  const [extra, setExtra] = useState('');

  const startEditing = () => {
    setStrategy(plan?.strategy ?? 'AVALANCHE');
    setExtra(plan ? String(plan.extraMonthlyMinorUnits) : '');
    setEditing(true);
  };

  const onSave = async () => {
    try {
      await savePlan.mutateAsync({
        strategy,
        extraMonthlyMinorUnits: Number(extra) || 0,
      });
      toast.success(t('debts.planCard.saved'));
      setEditing(false);
    } catch {
      toast.error(t('errors.UNKNOWN_ERROR'));
    }
  };

  const markPaid = (debtId: string, amount: number) => {
    addPayment.mutate({
      id: debtId,
      input: { amountMinorUnits: amount, date: new Date().toISOString() },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.loading')}
        </CardContent>
      </Card>
    );
  }

  if (!plan || editing) {
    return (
      <Card className="bg-primary/[0.05]">
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{t('debts.planCard.noPlanTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('debts.planCard.noPlanDescription')}</p>
          </div>

          <StrategyPicker value={strategy} onChange={setStrategy} />

          <div className="max-w-xs space-y-2">
            <Label htmlFor="plan-card-extra">{t('debts.plan.extra')}</Label>
            <CurrencyInput
              id="plan-card-extra"
              placeholder="0"
              minorUnits={minorUnits}
              value={extra}
              onValueChange={setExtra}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} disabled={savePlan.isPending}>
              {t('debts.planCard.activate')}
            </Button>
            {plan ? (
              <Button variant="ghost" onClick={() => setEditing(false)}>
                {t('common.cancel')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingTotal = plan.plannedTotalMinorUnits - plan.paidTotalMinorUnits;
  const doneCount = plan.items.filter((item) => item.isPaid).length;

  // ¿Este plan cabe dentro de lo que ganas este mes?
  const monthIncome = summary?.isCurrentMonth ? summary.totalIncome : 0;
  const cannotPay = monthIncome > 0 && plan.plannedTotalMinorUnits > monthIncome;
  const shortfall = Math.max(plan.plannedTotalMinorUnits - monthIncome, 0);

  return (
    <Card className="bg-primary/[0.05]">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{t('debts.planCard.title')}</p>
            <p className="text-sm text-muted-foreground">
              {t('debts.planCard.activeStrategy', {
                strategy: t(
                  `debts.plan.plan${plan.strategy === 'AVALANCHE' ? 'Avalanche' : 'Snowball'}`,
                ),
                amount: formatMoneyLocale(plan.extraMonthlyMinorUnits, currency),
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startEditing}>
              {t('debts.planCard.change')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePlan.mutate()}
              disabled={deletePlan.isPending}
            >
              <X className="mr-1 h-4 w-4" />
              {t('debts.planCard.deactivate')}
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-card p-3">
          <p className="text-xs text-muted-foreground">
            {t('debts.planCard.progress', {
              done: doneCount,
              total: plan.items.length,
            })}
          </p>
          <p className="tabular text-2xl font-semibold">
            {formatMoneyLocale(Math.max(pendingTotal, 0), currency)}
          </p>
          <p className="text-xs text-muted-foreground">{t('debts.planCard.remaining')}</p>
        </div>

        {cannotPay ? (
          <div className="flex gap-2 rounded-lg bg-destructive/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-destructive">
                {t('dashboard.overloadedTitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.overloadedText', {
                  payments: formatMoneyLocale(plan.plannedTotalMinorUnits, currency),
                  income: formatMoneyLocale(monthIncome, currency),
                  shortfall: formatMoneyLocale(shortfall, currency),
                })}
              </p>
              <p className="text-sm text-muted-foreground">{t('dashboard.tightAdvice')}</p>
            </div>
          </div>
        ) : null}

        <ul className="divide-y">
          {plan.items.map((item) => (
            <li key={item.debtId} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    item.isPaid
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border',
                  )}
                >
                  {item.isPaid ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="tabular block text-xs text-muted-foreground">
                    {t('debts.planCard.planned', {
                      amount: formatMoneyLocale(item.plannedMinorUnits, currency),
                    })}
                    {item.paidMinorUnits > 0
                      ? ` · ${t('debts.planCard.paid', {
                          amount: formatMoneyLocale(item.paidMinorUnits, currency),
                        })}`
                      : ''}
                  </span>
                </span>
              </span>

              <Button
                size="sm"
                variant={item.isPaid ? 'ghost' : 'outline'}
                disabled={item.isPaid || addPayment.isPending}
                onClick={() => markPaid(item.debtId, item.plannedMinorUnits)}
              >
                {item.isPaid ? t('debts.planCard.paidLabel') : t('debts.planCard.markPaid')}
              </Button>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          {t('debts.plan.freedom', { months: plan.monthsToFreedom })}
        </p>
      </CardContent>
    </Card>
  );
}
