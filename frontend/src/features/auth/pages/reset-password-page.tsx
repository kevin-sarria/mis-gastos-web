import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '../components/reset-password-form';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.reset.title')}</CardTitle>
          <CardDescription>{t('auth.reset.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('auth.reset.invalidToken')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
