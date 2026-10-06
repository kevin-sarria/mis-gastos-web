import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategorySelect } from '@/features/categories/components/category-select';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import { useCreateBudget } from '../hooks/use-budgets';
import { budgetFormSchema, type BudgetFormValues } from '../schemas/budget-form.schema';

export function BudgetForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createBudget = useCreateBudget();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
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
      toast.success('Presupuesto creado');
      form.reset();
      form.clearErrors();
      onDone?.();
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" placeholder="Ej. Alimentación" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Límite mensual</Label>
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
        <Label>Categoría</Label>
        <CategorySelect
          id="categoryId"
          type="EXPENSE"
          includeGlobalOption
          value={form.watch('categoryId')}
          onChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alertThresholdPct">Alerta al alcanzar (%)</Label>
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
        Guardar presupuesto
      </Button>
    </form>
  );
}
