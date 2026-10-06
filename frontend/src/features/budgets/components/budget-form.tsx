import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategorySelect } from '@/features/categories/components/category-select';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import { useCreateBudget } from '../hooks/use-budgets';
import { createBudgetFormSchema, type BudgetFormValues } from '../schemas/budget-form.schema';

export function BudgetForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createBudget = useCreateBudget();

  const schema = useMemo(() => createBudgetFormSchema(t), [t]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: '', categoryId: 'global', alertThresholdPct: 80 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createBudget.mutateAsync({
        name: values.name,
        amountMinorUnits: Number(values.amount),
        categoryId: values.categoryId === 'global' ? null : values.categoryId,
        period: 'MONTHLY',
        alertThresholdPct: values.alertThresholdPct,
      });
      toast.success(t('budgets.created'));
      form.reset();
      form.clearErrors();
      onDone?.();
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">{t('budgets.name')}</Label>
        <Input id="name" placeholder={t('budgets.namePlaceholder')} {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t('budgets.limit')}</Label>
        <Controller
          control={form.control}
          name="amount"
          render={({ field }) => (
            <CurrencyInput
              id="amount"
              placeholder="0"
              minorUnits={minorUnits}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        {form.formState.errors.amount ? (
          <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t('budgets.category')}</Label>
        <CategorySelect
          id="categoryId"
          type="EXPENSE"
          includeGlobalOption
          value={form.watch('categoryId')}
          onChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alertThresholdPct">{t('budgets.threshold')}</Label>
        <Input
          id="alertThresholdPct"
          type="number"
          min={1}
          max={100}
          {...form.register('alertThresholdPct', { valueAsNumber: true })}
        />
        {form.formState.errors.alertThresholdPct ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.alertThresholdPct.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t('budgets.submit')}
      </Button>
    </form>
  );
}
