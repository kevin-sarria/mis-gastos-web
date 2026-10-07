import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/store/auth-context';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import { microToPercent, percentToMicro } from '../domain/debt';
import type { Debt, LenderType } from '../domain/debt';
import { useCreateDebt, useUpdateDebt } from '../hooks/use-debts';

type TranslateFn = (key: string) => string;

const LENDER_TYPES: LenderType[] = [
  'BANK',
  'CREDIT_CARD',
  'STORE',
  'INFORMAL',
  'FAMILY',
  'OTHER',
];

const createDebtFormSchema = (t: TranslateFn) =>
  z.object({
    name: z.string().trim().min(1, t('validation.required')).max(120),
    lenderType: z.enum(['BANK', 'CREDIT_CARD', 'STORE', 'INFORMAL', 'FAMILY', 'OTHER']),
    lenderName: z.string().trim().max(120).optional(),
    balance: z
      .string()
      .min(1, t('validation.required'))
      .regex(/^\d+$/, t('validation.amountInvalid'))
      .refine((value) => Number(value) > 0, t('validation.amountPositive')),
    principal: z
      .string()
      .regex(/^\d*$/, t('validation.amountInvalid'))
      .optional(),
    ratePercent: z
      .number({ message: t('validation.required') })
      .min(0, t('validation.required'))
      .max(100, t('validation.percentageRange')),
    installment: z
      .string()
      .regex(/^\d*$/, t('validation.amountInvalid'))
      .optional(),
    remainingMonths: z.number().int().min(1).max(600).optional(),
    paymentDay: z.number().int().min(1).max(31).optional(),
    /** Pago único: no hay cuotas, se debe todo el saldo en una fecha. */
    isSinglePayment: z.boolean(),
    dueDate: z.string().optional(),
    startDate: z.string().min(1, t('validation.chooseDate')),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isSinglePayment && (!data.installment || Number(data.installment) <= 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['installment'],
        message: t('validation.amountPositive'),
      });
    }
    if (data.isSinglePayment && !data.dueDate) {
      ctx.addIssue({ code: 'custom', path: ['dueDate'], message: t('validation.chooseDate') });
    }
  });

type DebtFormValues = z.infer<ReturnType<typeof createDebtFormSchema>>;

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

function defaultValuesFrom(debt?: Debt): DebtFormValues {
  if (!debt) {
    return {
      name: '',
      lenderType: 'BANK',
      lenderName: '',
      balance: '',
      principal: '',
      ratePercent: 0,
      installment: '',
      isSinglePayment: false,
      dueDate: '',
      startDate: todayInputValue(),
      notes: '',
    };
  }
  return {
    name: debt.name,
    lenderType: debt.lenderType,
    lenderName: debt.lenderName ?? '',
    balance: String(debt.balanceMinorUnits),
    principal: debt.principalMinorUnits === null ? '' : String(debt.principalMinorUnits),
    ratePercent: microToPercent(debt.monthlyRateMicro),
    installment: String(debt.installmentMinorUnits),
    remainingMonths: debt.remainingMonths ?? undefined,
    paymentDay: debt.paymentDay ?? undefined,
    isSinglePayment: debt.isSinglePayment,
    dueDate: debt.dueDate ? debt.dueDate.slice(0, 10) : '',
    startDate: debt.startDate.slice(0, 10),
    notes: debt.notes ?? '',
  };
}

interface DebtFormProps {
  debt?: Debt;
  onDone?: () => void;
}

export function DebtForm({ debt, onDone }: DebtFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();

  const schema = useMemo(() => createDebtFormSchema(t), [t]);

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFrom(debt),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        lenderType: values.lenderType,
        lenderName: values.lenderName || null,
        balanceMinorUnits: Number(values.balance),
        principalMinorUnits: values.principal ? Number(values.principal) : null,
        monthlyRateMicro: percentToMicro(values.ratePercent),
        isSinglePayment: values.isSinglePayment,
        dueDate:
          values.isSinglePayment && values.dueDate
            ? new Date(values.dueDate).toISOString()
            : null,
        installmentMinorUnits: values.isSinglePayment
          ? Number(values.balance)
          : Number(values.installment),
        remainingMonths: values.isSinglePayment ? 1 : (values.remainingMonths ?? null),
        paymentDay: values.paymentDay ?? null,
        startDate: new Date(values.startDate).toISOString(),
        notes: values.notes || null,
        status: debt?.status ?? ('ACTIVE' as const),
      };

      if (debt) {
        await updateDebt.mutateAsync({ id: debt.id, input: payload });
      } else {
        await createDebt.mutateAsync(payload);
      }

      toast.success(t(debt ? 'debts.updated' : 'debts.created'));
      form.reset();
      form.clearErrors();
      onDone?.();
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="debt-name">{t('debts.form.name')}</Label>
        <Input
          id="debt-name"
          placeholder={t('debts.form.namePlaceholder')}
          {...form.register('name')}
        />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>{t('debts.form.paymentMode')}</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={form.watch('isSinglePayment') ? 'outline' : 'default'}
            onClick={() => form.setValue('isSinglePayment', false)}
          >
            {t('debts.form.modeInstallments')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={form.watch('isSinglePayment') ? 'default' : 'outline'}
            onClick={() => {
              form.setValue('isSinglePayment', true);
              const balance = form.getValues('balance');
              if (balance) form.setValue('installment', balance);
            }}
          >
            {t('debts.form.modeSingle')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('debts.form.paymentModeHint')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t('debts.form.lenderType')}</Label>
          <Select
            value={form.watch('lenderType')}
            onValueChange={(value) =>
              form.setValue('lenderType', value as LenderType, { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {LENDER_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`debts.lender.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="debt-lender">{t('debts.form.lenderName')}</Label>
          <Input
            id="debt-lender"
            placeholder={t('debts.form.lenderNamePlaceholder')}
            {...form.register('lenderName')}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-balance">{t('debts.form.balance')}</Label>
          <Controller
            control={form.control}
            name="balance"
            render={({ field }) => (
              <CurrencyInput
                id="debt-balance"
                placeholder="0"
                minorUnits={minorUnits}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // En pago único la "cuota" es el saldo completo.
                  if (form.getValues('isSinglePayment')) form.setValue('installment', value);
                }}
              />
            )}
          />
          {errors.balance ? (
            <p className="text-sm text-destructive">{errors.balance.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="debt-principal">{t('debts.form.principal')}</Label>
          <Controller
            control={form.control}
            name="principal"
            render={({ field }) => (
              <CurrencyInput
                id="debt-principal"
                placeholder="0"
                minorUnits={minorUnits}
                value={field.value ?? ''}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debt-rate">{t('debts.form.rate')}</Label>
          <Input
            id="debt-rate"
            type="number"
            step="0.01"
            min={0}
            max={100}
            {...form.register('ratePercent', { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">{t('debts.form.rateHint')}</p>
          {errors.ratePercent ? (
            <p className="text-sm text-destructive">{errors.ratePercent.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="debt-installment">{t('debts.form.installment')}</Label>
          {form.watch('isSinglePayment') ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t('debts.form.singlePaymentNote')}
            </p>
          ) : (
            <>
              <Controller
                control={form.control}
                name="installment"
                render={({ field }) => (
                  <CurrencyInput
                    id="debt-installment"
                    placeholder="0"
                    minorUnits={minorUnits}
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors.installment ? (
                <p className="text-sm text-destructive">{errors.installment.message}</p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="debt-months">
            {form.watch('isSinglePayment')
              ? t('debts.form.dueDate')
              : t('debts.form.remainingMonths')}
          </Label>
          {form.watch('isSinglePayment') ? (
            <>
              <Input id="debt-months" type="date" {...form.register('dueDate')} />
              {errors.dueDate ? (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              ) : null}
            </>
          ) : (
            <Input
              id="debt-months"
              type="number"
              min={1}
              max={600}
              {...form.register('remainingMonths', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
              })}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-day">{t('debts.form.paymentDay')}</Label>
          <Input
            id="debt-day"
            type="number"
            min={1}
            max={31}
            {...form.register('paymentDay', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="debt-start">{t('debts.form.startDate')}</Label>
          <Input id="debt-start" type="date" {...form.register('startDate')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="debt-notes">{t('debts.form.notes')}</Label>
        <Textarea id="debt-notes" {...form.register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t(debt ? 'common.saveChanges' : 'debts.form.submit')}
      </Button>
    </form>
  );
}
