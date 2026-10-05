import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/store/auth-context';
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
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Nombre:</span> {user?.name}
          </p>
          <p>
            <span className="text-muted-foreground">Correo:</span> {user?.email}
          </p>
          <p>
            <span className="text-muted-foreground">Moneda:</span> {user?.currency?.symbol}{' '}
            {user?.currencyCode}
          </p>
          <p>
            <span className="text-muted-foreground">Rol:</span>{' '}
            {user?.role === 'SUPER_ADMIN' ? 'Administrador' : 'Usuario'}
          </p>
        </CardContent>
      </Card>

      {user?.role === 'SUPER_ADMIN' ? <CurrencyManager /> : null}
    </div>
  );
}
