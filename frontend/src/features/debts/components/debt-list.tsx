import { AlertTriangle, HandCoins, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CurrencyInput } from '@/shared/components/currency-input';
import { formatMoneyLocale } from '@/shared/lib/format';
import type { Debt } from '../domain/debt';
import { formatRate } from '../domain/debt';
import { useAddPayment, useDeleteDebt } from '../hooks/use-debts';

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

interface PaymentDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PaymentDialog({ debt, open, onOpenChange }: PaymentDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const addPayment = useAddPayment();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayInputValue());

  const submit = async () => {
    try {
      await addPayment.mutateAsync({
        id: debt.id,
        input: { amountMinorUnits: Number(amount), date: new Date(date).toISOString() },
      });
      toast.success(t('debts.form.paymentRegistered'));
      setAmount('');
      onOpenChange(false);
    } catch {
      toast.error(t('errors.UNKNOWN_ERROR'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('debts.payLabel')}</DialogTitle>
          <DialogDescription>{debt.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">{t('debts.form.paymentAmount')}</Label>
            <CurrencyInput
              id="payment-amount"
              placeholder="0"
              minorUnits={minorUnits}
              value={amount}
              onValueChange={setAmount}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">{t('debts.form.paymentDate')}</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <Button className="w-full" disabled={!amount || Number(amount) <= 0} onClick={submit}>
            {t('debts.form.paymentRegistered')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
}

export function DebtList({ debts, onEdit }: DebtListProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const deleteDebt = useDeleteDebt();
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const currency = user?.currency;

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {debts.map((debt) => {
          const neverPays = !debt.analysis.liquidated;
          return (
            <li key={debt.id}>
              <Card size="sm" className="h-full">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{debt.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`debts.lender.${debt.lenderType}`)}
                        {debt.lenderName ? ` · ${debt.lenderName}` : ''}
                      </p>
                    </div>
                    <Badge variant={debt.status === 'PAID' ? 'secondary' : 'outline'}>
                      {t(`debts.status.${debt.status}`)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="tabular text-xl font-semibold">
                      {formatMoneyLocale(debt.balanceMinorUnits, currency)}
                    </span>
                    <Badge className="bg-primary/10 text-primary">
                      {t('debts.tea', { rate: formatRate(debt.teaMicro) })}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      TEM {formatRate(debt.monthlyRateMicro)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {t('debts.interestShare', {
                        amount: formatMoneyLocale(
                          debt.analysis.firstPaymentInterestMinorUnits,
                          currency,
                        ),
                      })}
                    </p>
                    <p className={neverPays ? 'text-destructive' : 'text-muted-foreground'}>
                      {neverPays
                        ? t('debts.neverPays')
                        : t('debts.monthsLeft', { count: debt.analysis.monthsToPayoff ?? 0 })}
                    </p>
                    <p className="text-muted-foreground">
                      {t('debts.interestTotal', {
                        amount: formatMoneyLocale(debt.analysis.totalInterestMinorUnits, currency),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setPayingDebt(debt)}>
                      <HandCoins className="mr-1 h-4 w-4" />
                      {t('debts.payLabel')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('debts.editLabel')}
                      onClick={() => onEdit(debt)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('debts.deleteLabel')}
                      onClick={() => deleteDebt.mutate(debt.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {neverPays ? (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      {payingDebt ? (
        <PaymentDialog
          debt={payingDebt}
          open={Boolean(payingDebt)}
          onOpenChange={(open) => {
            if (!open) setPayingDebt(null);
          }}
        />
      ) : null}
    </>
  );
}
