import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategoryManager } from '../components/category-manager';
import { PasswordForm } from '../components/password-form';
import { ProfileForm } from '../components/profile-form';
import { CurrencyManager } from '../components/currency-manager';

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('pages.settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('pages.settings.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <CategoryManager />

      {user?.role === 'SUPER_ADMIN' ? <CurrencyManager /> : null}
    </div>
  );
}
