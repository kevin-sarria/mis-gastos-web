import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function DashboardPage() {
  return (
    <PlaceholderPage
      icon={LayoutDashboard}
      titleKey="pages.dashboard.title"
      descriptionKey="pages.dashboard.description"
    />
  );
}
