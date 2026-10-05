import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CategoryType } from '../domain/category';
import { useCategories } from '../hooks/use-categories';
import { CategoryDot } from './category-dot';
import { CategoryForm } from './category-form';

const NEW_CATEGORY_VALUE = '__new_category__';
const GLOBAL_VALUE = 'global';

interface CategorySelectProps {
  type: CategoryType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  includeGlobalOption?: boolean;
}

export function CategorySelect({
  type,
  value,
  onChange,
  placeholder = 'Elige una categoría',
  id,
  includeGlobalOption = false,
}: CategorySelectProps) {
  const { data: categories = [] } = useCategories(type);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleValueChange = (next: string) => {
    if (next === NEW_CATEGORY_VALUE) {
      setDialogOpen(true);
      return;
    }
    onChange(next);
  };

  return (
    <>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {includeGlobalOption ? (
            <SelectItem value={GLOBAL_VALUE}>Global (todos los gastos)</SelectItem>
          ) : null}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <CategoryDot color={category.color} />
              {category.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={NEW_CATEGORY_VALUE}>
            <Plus className="h-4 w-4" />
            Nueva categoría
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Se guardará en tu cuenta para {type === 'INCOME' ? 'ingresos' : 'gastos'}.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            type={type}
            onCreated={(category) => {
              onChange(category.id);
              setDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
