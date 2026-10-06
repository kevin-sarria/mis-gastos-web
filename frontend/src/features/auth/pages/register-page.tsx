import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleButton } from '../components/google-button';
import { RegisterForm } from '../components/register-form';

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.createAccount')}</CardTitle>
          <CardDescription>{t('auth.createAccountDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
            </div>
          </div>
          <GoogleButton />
          <p className="text-center text-sm">
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">
              {t('auth.alreadyHaveAccount')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
