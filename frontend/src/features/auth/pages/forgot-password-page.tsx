import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForgotPasswordForm } from '../components/forgot-password-form';

export function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.forgot.title')}</CardTitle>
          <CardDescription>{t('auth.forgot.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ForgotPasswordForm />
          <p className="text-center text-sm">
            <Link to="/login" className="text-muted-foreground underline-offset-4 hover:underline">
              {t('auth.forgot.backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
