import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CurrencyInput } from '@/shared/components/currency-input';
import { cn } from '@/lib/utils';
import { formatMoneyLocale } from '@/shared/lib/format';
import { formatRate, percentToMicro } from '../domain/debt';
import { useSimulateDebt } from '../hooks/use-debts';

function ResultCard({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <Card size="sm" className={cn(highlight && 'bg-primary/[0.07]')}>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            'tabular font-semibold',
            highlight ? 'text-xl text-primary' : 'text-lg',
            danger && 'text-destructive',
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function DebtSimulator() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const currency = user?.currency;
  const simulate = useSimulateDebt();

  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('2');
  const [mode, setMode] = useState<'term' | 'payment'>('term');
  const [term, setTerm] = useState('12');
  const [payment, setPayment] = useState('');

  const canRun =
    Number(amount) > 0 &&
    Number(rate) >= 0 &&
    (mode === 'term' ? Number(term) > 0 : Number(payment) > 0);

  const run = () => {
    if (!canRun) return;
    simulate.mutate({
      amountMinorUnits: Number(amount),
      monthlyRateMicro: percentToMicro(Number(rate)),
      ...(mode === 'term' ? { months: Number(term) } : { paymentMinorUnits: Number(payment) }),
    });
  };

  const result = simulate.data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('debts.simulator.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('debts.simulator.description')}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sim-amount">{t('debts.simulator.amount')}</Label>
              <CurrencyInput
                id="sim-amount"
                placeholder="0"
                minorUnits={minorUnits}
                value={amount}
                onValueChange={setAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sim-rate">{t('debts.simulator.rate')}</Label>
              <Input
                id="sim-rate"
                type="number"
                step="0.01"
                min={0}
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('debts.simulator.mode')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === 'term' ? 'default' : 'outline'}
                onClick={() => setMode('term')}
              >
                {t('debts.simulator.modeTerm')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'payment' ? 'default' : 'outline'}
                onClick={() => setMode('payment')}
              >
                {t('debts.simulator.modePayment')}
              </Button>
            </div>
          </div>

          {mode === 'term' ? (
            <div className="space-y-2">
              <Label htmlFor="sim-term">{t('debts.simulator.term')}</Label>
              <Input
                id="sim-term"
                type="number"
                min={1}
                max={600}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="sim-payment">{t('debts.simulator.payment')}</Label>
              <CurrencyInput
                id="sim-payment"
                placeholder="0"
                minorUnits={minorUnits}
                value={payment}
                onValueChange={setPayment}
              />
            </div>
          )}

          <Button onClick={run} disabled={!canRun || simulate.isPending}>
            {t('debts.simulator.submit')}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard
              label={t('debts.simulator.payment')}
              value={formatMoneyLocale(result.monthlyPaymentMinorUnits, currency)}
              highlight
            />
            <ResultCard
              label={t('debts.simulator.totalInterest')}
              value={formatMoneyLocale(result.totalInterestMinorUnits, currency)}
              danger
            />
            <ResultCard
              label={t('debts.simulator.totalPaid')}
              value={formatMoneyLocale(result.totalPaidMinorUnits, currency)}
            />
            <ResultCard label={t('debts.simulator.tea')} value={formatRate(result.teaMicro)} />
          </div>

          <Card className={cn(!result.viable && 'bg-destructive/[0.06]')}>
            <CardContent className="space-y-1">
              {result.viable ? (
                <>
                  <p className="text-sm font-medium">
                    {t('debts.simulator.firstShare', {
                      percent: result.firstPaymentInterestSharePct,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('debts.simulator.overPrincipal', {
                      percent: result.interestOverPrincipalPct,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('debts.simulator.months')}: {result.months}
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-destructive">
                  {t('debts.simulator.never')}
                </p>
              )}
            </CardContent>
          </Card>

          {result.schedule.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('debts.simulator.table.period')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          {t('debts.simulator.table.period')}
                        </th>
                        <th className="px-3 py-2 text-right">
                          {t('debts.simulator.table.payment')}
                        </th>
                        <th className="px-3 py-2 text-right">
                          {t('debts.simulator.table.interest')}
                        </th>
                        <th className="px-3 py-2 text-right">
                          {t('debts.simulator.table.principal')}
                        </th>
                        <th className="px-3 py-2 text-right">
                          {t('debts.simulator.table.balance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {result.schedule.map((row) => (
                        <tr key={row.period}>
                          <td className="px-3 py-1.5">{row.period}</td>
                          <td className="tabular px-3 py-1.5 text-right">
                            {formatMoneyLocale(row.paymentMinorUnits, currency)}
                          </td>
                          <td className="tabular px-3 py-1.5 text-right text-destructive">
                            {formatMoneyLocale(row.interestMinorUnits, currency)}
                          </td>
                          <td className="tabular px-3 py-1.5 text-right">
                            {formatMoneyLocale(row.principalMinorUnits, currency)}
                          </td>
                          <td className="tabular px-3 py-1.5 text-right text-muted-foreground">
                            {formatMoneyLocale(row.balanceMinorUnits, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
