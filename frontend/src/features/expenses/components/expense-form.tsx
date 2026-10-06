import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategorySelect } from '@/features/categories/components/category-select';
import { httpFileApi } from '@/features/files/api/file-api';
import { CurrencyInput } from '@/shared/components/currency-input';
import { messageFromError } from '@/shared/lib/error-message';
import type { Expense, ExpenseTag } from '../domain/expense';
import { useCreateExpense, useUpdateExpense } from '../hooks/use-expenses';
import { createExpenseFormSchema, type ExpenseFormValues } from '../schemas/expense-form.schema';

const TAG_OPTIONS: ExpenseTag[] = ['FIXED', 'VARIABLE', 'EMERGENCY', 'ANT_EXPENSE'];

function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

function defaultValuesFrom(expense?: Expense): ExpenseFormValues {
  if (!expense) {
    return {
      categoryId: '',
      title: '',
      amount: '',
      date: todayInputValue(),
      tags: [],
      justification: '',
    };
  }
  return {
    categoryId: expense.categoryId,
    title: expense.title,
    amount: String(expense.amountMinorUnits),
    date: expense.date.slice(0, 10),
    tags: expense.tags,
    justification: expense.justification ?? '',
  };
}

interface ExpenseFormProps {
  expense?: Expense;
  onDone?: () => void;
}

export function ExpenseForm({ expense, onDone }: ExpenseFormProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const minorUnits = user?.currency?.minorUnits ?? 2;
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [file, setFile] = useState<File | null>(null);

  const schema = useMemo(() => createExpenseFormSchema(t), [t]);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValuesFrom(expense),
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
      const payload = {
        categoryId: values.categoryId,
        title: values.title,
        amountMinorUnits: Number(values.amount),
        date: new Date(values.date).toISOString(),
        tags: values.tags,
        justification: values.justification || null,
      };

      if (expense) {
        await updateExpense.mutateAsync({ id: expense.id, input: payload });
      } else {
        const created = await createExpense.mutateAsync(payload);
        if (file) {
          await httpFileApi.upload(created.id, file);
        }
      }

      toast.success(t(expense ? 'expenses.updated' : 'expenses.created'));
      form.reset();
      form.clearErrors();
      setFile(null);
      onDone?.();
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">{t('expenses.titleLabel')}</Label>
        <Input id="title" placeholder={t('expenses.titlePlaceholder')} {...form.register('title')} />
        {form.formState.errors.title ? (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t('expenses.amount')}</Label>
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
        <Label>{t('expenses.category')}</Label>
        <CategorySelect
          id="categoryId"
          type="EXPENSE"
          value={form.watch('categoryId')}
          onChange={(value) => form.setValue('categoryId', value, { shouldValidate: true })}
        />
        {form.formState.errors.categoryId ? (
          <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t('expenses.tags')}</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={tags.includes(tag) ? 'default' : 'outline'}
              onClick={() => toggleTag(tag)}
            >
              {t(`expenses.tagsLabel.${tag}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t('expenses.date')}</Label>
        <Input id="date" type="date" {...form.register('date')} />
        {form.formState.errors.date ? (
          <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="justification">{t('expenses.justification')}</Label>
        <Textarea
          id="justification"
          placeholder={t('expenses.justificationPlaceholder')}
          {...form.register('justification')}
        />
      </div>

      {expense ? null : (
        <div className="space-y-2">
          <Label htmlFor="file">{t('expenses.invoice')}</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t(expense ? 'common.saveChanges' : 'expenses.submit')}
      </Button>
    </form>
  );
}
