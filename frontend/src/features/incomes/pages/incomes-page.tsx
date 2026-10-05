import { Wallet } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function IncomesPage() {
  return (
    <PlaceholderPage
      icon={Wallet}
      titleKey="pages.incomes.title"
      descriptionKey="pages.incomes.description"
    />
  );
}
