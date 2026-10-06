import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleButton } from '../components/google-button';
import { LoginForm } from '../components/login-form';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('auth.signIn')}</CardTitle>
          <CardDescription>{t('auth.signInDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('auth.or')}</span>
            </div>
          </div>
          <GoogleButton />
          <div className="flex flex-col gap-2 text-center text-sm">
            <Link to="/registro" className="text-primary underline-offset-4 hover:underline">
              {t('auth.noAccount')}
            </Link>
            <Link
              to="/recuperar-contrasena"
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              {t('auth.forgotLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
