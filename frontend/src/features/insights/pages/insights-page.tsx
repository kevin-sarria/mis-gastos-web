import { TrendingUp } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function InsightsPage() {
  return (
    <PlaceholderPage
      icon={TrendingUp}
      titleKey="pages.insights.title"
      descriptionKey="pages.insights.description"
    />
  );
}
