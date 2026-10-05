import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { useAuth } from '@/features/auth/store/auth-context';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { messageFromError } from '@/shared/lib/error-message';
import { parseAmountToMinorUnits } from '@/shared/lib/money';
import { useCreateBudget } from '../hooks/use-budgets';
import { budgetFormSchema, type BudgetFormValues } from '../schemas/budget-form.schema';

export function BudgetForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const createBudget = useCreateBudget();
  const { data: categories = [] } = useCategories('EXPENSE');

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { name: '', amount: '', categoryId: 'global', alertThresholdPct: 80 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createBudget.mutateAsync({
        name: values.name,
        amountMinorUnits: parseAmountToMinorUnits(
          values.amount,
          user?.currency?.minorUnits ?? 2,
        ),
        categoryId: values.categoryId === 'global' ? null : values.categoryId,
        period: 'MONTHLY',
        alertThresholdPct: values.alertThresholdPct,
      });
      toast.success('Presupuesto creado');
      form.reset();
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
        <Input id="amount" inputMode="decimal" placeholder="0.00" {...form.register('amount')} />
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="global">Global (todos los gastos)</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <p className="text-sm text-destructive">{form.formState.errors.alertThresholdPct.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Guardar presupuesto
      </Button>
    </form>
  );
}
