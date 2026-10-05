import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { messageFromError } from '@/shared/lib/error-message';
import type { Category, CategoryType } from '../domain/category';
import {
  CATEGORY_COLOR_PRESETS,
  DEFAULT_CATEGORY_COLOR,
} from '../domain/category-colors';
import { useCreateCategory } from '../hooks/use-categories';

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  type: CategoryType;
  onCreated?: (category: Category) => void;
}

export function CategoryForm({ type, onCreated }: CategoryFormProps) {
  const createCategory = useCreateCategory();
  const [color, setColor] = useState<string>(DEFAULT_CATEGORY_COLOR);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const category = await createCategory.mutateAsync({
        type,
        name: values.name,
        color,
      });
      toast.success('Categoría creada');
      form.reset();
      setColor(DEFAULT_CATEGORY_COLOR);
      onCreated?.(category);
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="category-name">Nombre</Label>
        <Input id="category-name" placeholder="Ej. Mascotas" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              aria-label={`Elegir color ${preset}`}
              aria-pressed={color === preset}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-transform',
                color === preset
                  ? 'scale-110 border-foreground'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Crear categoría
      </Button>
    </form>
  );
}
