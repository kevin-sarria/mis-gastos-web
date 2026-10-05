export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  userId: string | null;
}
