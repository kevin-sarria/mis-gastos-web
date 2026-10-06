import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategorySelect } from '@/features/categories/components/category-select';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import type { Income } from '../domain/income';
import { useCreateIncome, useUpdateIncome } from '../hooks/use-incomes';
import { incomeFormSchema, type IncomeFormValues } from '../schemas/income-form.schema';

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

function defaultValuesFrom(income?: Income): IncomeFormValues {
  if (!income) {
    return { categoryId: '', title: '', amount: '', date: todayInputValue(), note: '' };
  }
  return {
    categoryId: income.categoryId,
    title: income.title,
    amount: String(income.amountMinorUnits),
    date: income.date.slice(0, 10),
    note: income.note ?? '',
  };
}

interface IncomeFormProps {
  income?: Income;
  onDone?: () => void;
}

export function IncomeForm({ income, onDone }: IncomeFormProps) {
  const { user } = useAuth();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: defaultValuesFrom(income),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        categoryId: values.categoryId,
        title: values.title,
        amountMinorUnits: Number(values.amount),
        date: new Date(values.date).toISOString(),
        note: values.note || null,
      };

      if (income) {
        await updateIncome.mutateAsync({ id: income.id, input: payload });
      } else {
        await createIncome.mutateAsync(payload);
      }

      toast.success(income ? 'Ingreso actualizado' : 'Ingreso registrado');
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
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ej. Sueldo de octubre" {...form.register('title')} />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
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
          type="INCOME"
          value={form.watch('categoryId')}
          onChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
        />
        {form.formState.errors.categoryId ? (
          <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" {...form.register('date')} />
        {form.formState.errors.date ? (
          <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Nota (opcional)</Label>
        <Textarea id="note" {...form.register('note')} />
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {income ? 'Guardar cambios' : 'Guardar ingreso'}
      </Button>
    </form>
  );
}
