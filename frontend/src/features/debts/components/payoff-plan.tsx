import { Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CurrencyInput } from '@/shared/components/currency-input';
import { cn } from '@/lib/utils';
import { formatMoneyLocale } from '@/shared/lib/format';
import { monthlyInterestMinorUnits, type PayoffResult } from '../domain/debt';
import { usePayoffPlan } from '../hooks/use-debts';

interface StrategyCardProps {
  title: string;
  hint: string;
  plan: PayoffResult;
  maxMonths: number;
  highlighted?: boolean;
  badge?: { label: string; className: string };
  startName?: string;
  footer?: { text: string; className: string };
}

function StrategyCard({
  title,
  hint,
  plan,
  maxMonths,
  highlighted,
  badge,
  startName,
  footer,
}: StrategyCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currency = user?.currency;
  const width = maxMonths > 0 ? Math.max((plan.months / maxMonths) * 100, 6) : 0;

  return (
    <Card className={cn('h-full', highlighted && 'bg-primary/[0.07]')}>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium">{title}</p>
          {badge ? <Badge className={badge.className}>{badge.label}</Badge> : null}
        </div>

        <p className="text-sm text-muted-foreground">{hint}</p>

        {startName ? (
          <p className="text-sm font-medium">
            {t('debts.plan.startsWith', { name: startName })}
          </p>
        ) : null}

        <div className="space-y-1.5">
          <p className={cn('tabular text-2xl font-semibold', highlighted && 'text-primary')}>
            {t('debts.plan.months', { count: plan.months })}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full',
                highlighted ? 'bg-primary' : 'bg-muted-foreground/40',
              )}
              style={{ width: `${width}%` }}
            />
          </div>
          <p className="tabular text-sm text-muted-foreground">
            {t('debts.plan.interest', {
              amount: formatMoneyLocale(plan.totalInterestMinorUnits, currency),
            })}
          </p>
        </div>

        {footer ? <p className={cn('text-sm font-medium', footer.className)}>{footer.text}</p> : null}

        {plan.payoffOrder.length > 0 ? (
          <div className="mt-auto space-y-1 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">{t('debts.plan.order')}</p>
            <ol className="space-y-1">
              {plan.payoffOrder.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{entry.name}</span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {t('debts.plan.month', { count: entry.monthPaidOff })}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PayoffPlanView() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const currency = user?.currency;

  // `input` es lo que escribes; `extra` es lo que ya se pidió al servidor.
  const [input, setInput] = useState('');
  const [extra, setExtra] = useState(0);
  const { data, isLoading, isFetching } = usePayoffPlan(extra);

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t('common.loading')}
      </div>
    );
  }

  if (data.totalBalanceMinorUnits === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t('debts.plan.emptyDescription')}
        </CardContent>
      </Card>
    );
  }

  const { minimumsOnly, avalanche, snowball } = data.plans;
  const bestInterest = Math.min(
    minimumsOnly.totalInterestMinorUnits,
    avalanche.totalInterestMinorUnits,
    snowball.totalInterestMinorUnits,
  );
  const bestMonths = Math.min(minimumsOnly.months, avalanche.months, snowball.months);
  const saving = Math.max(minimumsOnly.totalInterestMinorUnits - bestInterest, 0);
  const monthsSaved = Math.max(minimumsOnly.months - bestMonths, 0);
  const maxMonths = Math.max(minimumsOnly.months, avalanche.months, snowball.months);

  const applied = data.extraMonthlyMinorUnits;
  const pending = Number(input) || 0;
  const suggested = Math.round(data.totalMonthlyPaymentMinorUnits * 0.1);
  const tooSmall = applied > 0 && saving < minimumsOnly.totalInterestMinorUnits * 0.02;

  const debtsByCost = [...data.debts].sort(
    (a, b) =>
      monthlyInterestMinorUnits(b.balanceMinorUnits, b.monthlyRateMicro) -
      monthlyInterestMinorUnits(a.balanceMinorUnits, a.monthlyRateMicro),
  );
  const first = debtsByCost[0];
  const maxInterest = first
    ? monthlyInterestMinorUnits(first.balanceMinorUnits, first.monthlyRateMicro)
    : 0;

  const quickOptions = [5, 10, 25].map((percent) => ({
    label: t('debts.plan.quickName', { percent }),
    value: Math.round(data.totalMonthlyPaymentMinorUnits * (percent / 100)),
  }));

  const applyExtra = (value: number) => {
    setInput(String(value));
    setExtra(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{t('debts.plan.title')}</p>
            <p className="text-sm text-muted-foreground">{t('debts.plan.description')}</p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium">{t('debts.plan.nothingTitle')}</p>
            <p className="text-sm text-muted-foreground">
              {t('debts.plan.nothingText', {
                months: minimumsOnly.months,
                amount: formatMoneyLocale(minimumsOnly.totalInterestMinorUnits, currency),
              })}
            </p>
          </div>

          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setExtra(pending);
            }}
          >
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="plan-extra">{t('debts.plan.extra')}</Label>
              <CurrencyInput
                id="plan-extra"
                placeholder="0"
                minorUnits={minorUnits}
                value={input}
                onValueChange={setInput}
              />
              <p className="text-xs text-muted-foreground">{t('debts.plan.extraHint')}</p>
            </div>
            <Button type="submit" disabled={pending === extra || isFetching}>
              {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isFetching ? t('debts.plan.calculating') : t('debts.plan.calculate')}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('debts.plan.quick')}</span>
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyExtra(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {applied === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('debts.plan.noExtra')}</p>
          </CardContent>
        </Card>
      ) : tooSmall ? (
        <Card className="bg-amber-500/10">
          <CardContent>
            <p className="text-sm font-medium">
              {t('debts.plan.tooSmall', {
                amount: formatMoneyLocale(applied, currency),
                suggested: formatMoneyLocale(suggested, currency),
              })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-primary/[0.07]">
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold text-primary">
              {t('debts.plan.savingTitle', { amount: formatMoneyLocale(saving, currency) })}
            </p>
            <p className="text-sm text-muted-foreground">
              {monthsSaved > 0
                ? t('debts.plan.savingMonths', { months: monthsSaved })
                : t('debts.plan.savingNoMonths')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex gap-2 rounded-lg bg-accent/50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{t('debts.plan.howTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('debts.plan.howText')}</p>
            </div>
          </div>

          <div>
            <p className="font-medium">{t('debts.plan.costTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('debts.plan.costHint')}</p>
          </div>

          <ul className="space-y-2.5">
            {debtsByCost.map((debt, index) => {
              const interest = monthlyInterestMinorUnits(
                debt.balanceMinorUnits,
                debt.monthlyRateMicro,
              );
              return (
                <li key={debt.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">
                      {index + 1}. {debt.name}
                    </span>
                    <span
                      className={cn(
                        'tabular shrink-0 font-medium',
                        index === 0 ? 'text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {t('debts.plan.perMonth', {
                        amount: formatMoneyLocale(interest, currency),
                      })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        index === 0 ? 'bg-destructive' : 'bg-muted-foreground/40',
                      )}
                      style={{ width: `${maxInterest > 0 ? (interest / maxInterest) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className={cn('grid gap-4 lg:grid-cols-3', isFetching && 'opacity-60')}>
        <StrategyCard
          title={t('debts.plan.planNothing')}
          hint={t('debts.plan.planNothingHint')}
          plan={minimumsOnly}
          maxMonths={maxMonths}
          footer={{
            text: t('debts.plan.costsMore', {
              amount: formatMoneyLocale(minimumsOnly.totalInterestMinorUnits - bestInterest, currency),
            }),
            className: 'text-destructive',
          }}
        />
        <StrategyCard
          title={t('debts.plan.planAvalanche')}
          hint={t('debts.plan.planAvalancheHint')}
          plan={avalanche}
          maxMonths={maxMonths}
          highlighted
          badge={{ label: t('debts.plan.best'), className: 'bg-primary/15 text-primary' }}
          startName={avalanche.payoffOrder[0]?.name}
          footer={{
            text: t('debts.plan.saves', {
              amount: formatMoneyLocale(
                minimumsOnly.totalInterestMinorUnits - avalanche.totalInterestMinorUnits,
                currency,
              ),
            }),
            className: 'text-primary',
          }}
        />
        <StrategyCard
          title={t('debts.plan.planSnowball')}
          hint={t('debts.plan.planSnowballHint')}
          plan={snowball}
          maxMonths={maxMonths}
          startName={snowball.payoffOrder[0]?.name}
          footer={{
            text: t('debts.plan.costsMore', {
              amount: formatMoneyLocale(snowball.totalInterestMinorUnits - bestInterest, currency),
            }),
            className: 'text-muted-foreground',
          }}
        />
      </div>
    </div>
  );
}
