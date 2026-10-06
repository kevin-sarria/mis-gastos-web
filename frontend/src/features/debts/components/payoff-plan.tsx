import { Snowflake, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CurrencyInput } from '@/shared/components/currency-input';
import { cn } from '@/lib/utils';
import { formatMoneyLocale } from '@/shared/lib/format';
import type { PayoffResult } from '../domain/debt';
import { usePayoffPlan } from '../hooks/use-debts';

function PlanCard({
  title,
  hint,
  plan,
  recommended,
  icon: Icon,
}: {
  title: string;
  hint?: string;
  plan: PayoffResult;
  recommended?: boolean;
  icon?: typeof TrendingDown;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currency = user?.currency;

  return (
    <Card className={cn(recommended && 'bg-primary/[0.07]')}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-medium">
            {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
            {title}
          </span>
          {recommended ? <Badge className="bg-primary/15 text-primary">{t('debts.plan.recommended')}</Badge> : null}
        </div>

        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

        <p className={cn('tabular text-2xl font-semibold', recommended && 'text-primary')}>
          {t('debts.plan.months', { count: plan.months })}
        </p>
        <p className="tabular text-sm text-muted-foreground">
          {t('debts.plan.interest', {
            amount: formatMoneyLocale(plan.totalInterestMinorUnits, currency),
          })}
        </p>

        {plan.payoffOrder.length > 0 ? (
          <div className="space-y-1 border-t pt-3">
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
  const [extra, setExtra] = useState('');
  const { data, isLoading } = usePayoffPlan(Number(extra) || 0);

  if (isLoading || !data) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{t('debts.plan.title')}</p>
            <p className="text-sm text-muted-foreground">{t('debts.plan.description')}</p>
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="plan-extra">{t('debts.plan.extra')}</Label>
            <CurrencyInput
              id="plan-extra"
              placeholder="0"
              minorUnits={minorUnits}
              value={extra}
              onValueChange={setExtra}
            />
            <p className="text-xs text-muted-foreground">{t('debts.plan.extraHint')}</p>
          </div>
        </CardContent>
      </Card>

      {data.savingsVsMinimumsMinorUnits > 0 ? (
        <Card className="bg-primary/[0.07]">
          <CardContent>
            <p className="font-medium text-primary">
              {t('debts.plan.savings', {
                amount: formatMoneyLocale(data.savingsVsMinimumsMinorUnits, currency),
                months: data.monthsSavedVsMinimums,
              })}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard title={t('debts.plan.minimumsOnly')} plan={minimumsOnly} />
        <PlanCard
          title={t('debts.plan.avalanche')}
          hint={t('debts.plan.avalancheHint')}
          plan={avalanche}
          recommended
          icon={TrendingDown}
        />
        <PlanCard
          title={t('debts.plan.snowball')}
          hint={t('debts.plan.snowballHint')}
          plan={snowball}
          icon={Snowflake}
        />
      </div>
    </div>
  );
}
