import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CategoryDot } from '@/features/categories/components/category-dot';
import { CategoryForm } from '@/features/categories/components/category-form';
import type { Category, CategoryType } from '@/features/categories/domain/category';
import {
  useCategories,
  useDeleteCategory,
} from '@/features/categories/hooks/use-categories';

export function CategoryManager() {
  const { data: incomeCategories = [] } = useCategories('INCOME');
  const { data: expenseCategories = [] } = useCategories('EXPENSE');
  const deleteCategory = useDeleteCategory();

  const [editing, setEditing] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newType, setNewType] = useState<CategoryType>('EXPENSE');

  const renderList = (categories: Category[]) => (
    <ul className="divide-y">
      {categories.map((category) => (
        <li key={category.id} className="flex items-center justify-between gap-3 py-2">
          <span className="flex min-w-0 items-center gap-2">
            <CategoryDot color={category.color} />
            <span className="truncate text-sm">{category.name}</span>
            {category.isDefault ? <Badge variant="secondary">Por defecto</Badge> : null}
          </span>

          {category.isDefault ? null : (
            <span className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Editar categoría"
                onClick={() => {
                  setEditing(category);
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Borrar categoría"
                onClick={() => deleteCategory.mutate(category.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </span>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Categorías</CardTitle>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          Nueva categoría
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium">Ingresos</p>
          {renderList(incomeCategories)}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Gastos</p>
          {renderList(expenseCategories)}
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>Cambia el nombre o el color.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <CategoryForm
              type={editing.type}
              category={editing}
              onSaved={() => setEditOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>Elige el tipo, el nombre y el color.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={newType === 'EXPENSE' ? 'default' : 'outline'}
                onClick={() => setNewType('EXPENSE')}
              >
                Gasto
              </Button>
              <Button
                type="button"
                size="sm"
                variant={newType === 'INCOME' ? 'default' : 'outline'}
                onClick={() => setNewType('INCOME')}
              >
                Ingreso
              </Button>
            </div>
          </div>
          <CategoryForm type={newType} onSaved={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
