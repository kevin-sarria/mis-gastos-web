import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from './empty-state';

interface PlaceholderPageProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

export function PlaceholderPage({ icon, titleKey, descriptionKey }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
        <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
      </div>
      <EmptyState icon={icon} title={t('common.comingSoon')} description={t(descriptionKey)} />
    </div>
  );
}
