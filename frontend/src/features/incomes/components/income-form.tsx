import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { useCategories } from '@/features/categories/hooks/use-categories';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import { useCreateIncome } from '../hooks/use-incomes';
import { incomeFormSchema, type IncomeFormValues } from '../schemas/income-form.schema';

const FREQUENCIES = [
  { value: 'ONE_TIME', label: 'Única' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'DAILY', label: 'Diaria' },
  { value: 'YEARLY', label: 'Anual' },
];

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export function IncomeForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createIncome = useCreateIncome();
  const { data: categories = [] } = useCategories('INCOME');

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      categoryId: '',
      title: '',
      amount: '',
      frequency: 'MONTHLY',
      date: todayInputValue(),
      note: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createIncome.mutateAsync({
        categoryId: values.categoryId,
        title: values.title,
        amountMinorUnits: Number(values.amount),
        frequency: values.frequency,
        date: new Date(values.date).toISOString(),
        note: values.note || null,
      });
      toast.success('Ingreso registrado');
      form.reset();
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
        <Select
          value={form.watch('categoryId')}
          onValueChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
        >
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.categoryId ? (
          <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Frecuencia</Label>
        <Select
          value={form.watch('frequency')}
          onValueChange={(value) =>
            form.setValue('frequency', value as IncomeFormValues['frequency'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {FREQUENCIES.map((frequency) => (
              <SelectItem key={frequency.value} value={frequency.value}>
                {frequency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        Guardar ingreso
      </Button>
    </form>
  );
}
