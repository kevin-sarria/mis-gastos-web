import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">{t('common.notFound')}</h1>
      <p className="text-sm text-muted-foreground">{t('common.notFoundDescription')}</p>
      <Button asChild>
        <Link to="/">{t('common.backHome')}</Link>
      </Button>
    </div>
  );
}
