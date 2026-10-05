import { PiggyBank } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function BudgetsPage() {
  return (
    <PlaceholderPage
      icon={PiggyBank}
      titleKey="pages.budgets.title"
      descriptionKey="pages.budgets.description"
    />
  );
}
