import { Settings } from 'lucide-react';
import { PlaceholderPage } from '@/shared/components/placeholder-page';

export function SettingsPage() {
  return (
    <PlaceholderPage
      icon={Settings}
      titleKey="pages.settings.title"
      descriptionKey="pages.settings.description"
    />
  );
}
