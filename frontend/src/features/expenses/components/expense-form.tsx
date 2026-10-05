import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { httpFileApi } from '@/features/files/api/file-api';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import { EXPENSE_TAG_LABELS } from '../domain/expense';
import type { ExpenseTag } from '../domain/expense';
import { useCreateExpense } from '../hooks/use-expenses';
import { expenseFormSchema, type ExpenseFormValues } from '../schemas/expense-form.schema';

const TAG_OPTIONS: ExpenseTag[] = ['FIXED', 'VARIABLE', 'EMERGENCY', 'ANT_EXPENSE'];

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

export function ExpenseForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createExpense = useCreateExpense();
  const { data: categories = [] } = useCategories('EXPENSE');
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      categoryId: '',
      title: '',
      amount: '',
      date: todayInputValue(),
      tags: [],
      justification: '',
    },
  });

  const tags = form.watch('tags');

  const toggleTag = (tag: ExpenseTag) => {
    const current = form.getValues('tags');
    const next = current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag];
    form.setValue('tags', next, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const expense = await createExpense.mutateAsync({
        categoryId: values.categoryId,
        title: values.title,
        amountMinorUnits: Number(values.amount),
        date: new Date(values.date).toISOString(),
        tags: values.tags,
        justification: values.justification || null,
      });

      if (file) {
        await httpFileApi.upload(expense.id, file);
      }

      toast.success('Gasto registrado');
      form.reset();
      setFile(null);
      onDone?.();
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" placeholder="Ej. Compra del supermercado" {...form.register('title')} />
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
        <Label>Etiquetas</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={tags.includes(tag) ? 'default' : 'outline'}
              onClick={() => toggleTag(tag)}
            >
              {EXPENSE_TAG_LABELS[tag]}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input id="date" type="date" {...form.register('date')} />
        {form.formState.errors.date ? (
          <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">Justificación (opcional)</Label>
        <Textarea
          id="justification"
          placeholder="¿Por qué fue necesario este gasto?"
          {...form.register('justification')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Factura (PDF o imagen, máx. 10 MB)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Guardar gasto
      </Button>
    </form>
  );
}
