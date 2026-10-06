import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CategoryType } from '../domain/category';
import { useCategories } from '../hooks/use-categories';
import { CategoryDot } from './category-dot';
import { CategoryForm } from './category-form';

interface CategorySelectProps {
  id?: string;
  type: CategoryType;
  value: string;
  onChange: (value: string) => void;
  includeGlobalOption?: boolean;
}

export function CategorySelect({
  id,
  type,
  value,
  onChange,
  includeGlobalOption = false,
}: CategorySelectProps) {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories(type);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selected = categories.find((category) => category.id === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={t('categories.choose')}>
              {selected ? (
                <span className="flex items-center gap-2">
                  <CategoryDot color={selected.color} />
                  {selected.name}
                </span>
              ) : value === 'global' && includeGlobalOption ? (
                t('common.allExpenses')
              ) : (
                t('categories.choose')
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {includeGlobalOption ? (
              <SelectItem value="global">{t('common.allExpenses')}</SelectItem>
            ) : null}
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">{t('common.loading')}</div>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <CategoryDot color={category.color} />
                    {category.name}
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('categories.new')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('categories.new')}</DialogTitle>
              <DialogDescription>
                {t('categories.saveFor', {
                  type: t(type === 'INCOME' ? 'categories.incomeType' : 'categories.expenseType'),
                })}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              type={type}
              onSaved={(category) => {
                onChange(category.id);
                setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
