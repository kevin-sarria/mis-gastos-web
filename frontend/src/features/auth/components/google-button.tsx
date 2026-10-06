import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';
import { Button } from '@/components/ui/button';

export function GoogleButton() {
  const { t } = useTranslation();

  const startGoogleLogin = () => {
    window.location.href = `${env.VITE_API_URL}/auth/google`;
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={startGoogleLogin}>
      {t('auth.continueWithGoogle')}
    </Button>
  );
}
