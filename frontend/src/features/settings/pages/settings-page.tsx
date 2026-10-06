import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/store/auth-context';
import { CategoryManager } from '../components/category-manager';
import { CurrencyManager } from '../components/currency-manager';
import { PasswordForm } from '../components/password-form';
import { ProfileForm } from '../components/profile-form';

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.password')}</CardTitle>
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
