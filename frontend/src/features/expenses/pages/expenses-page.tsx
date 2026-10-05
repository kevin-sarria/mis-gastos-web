import { Receipt } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function ExpensesPage() {
  return (
    <PlaceholderPage
      icon={Receipt}
      titleKey="pages.expenses.title"
      descriptionKey="pages.expenses.description"
    />
  );
}
