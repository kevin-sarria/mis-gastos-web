import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { tokenStorage } from '@/core/http/token-storage';
import { httpAuthApi } from '../api/http-auth-api';
import { useAuth } from '../store/auth-context';

export function GoogleCallbackPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;

    const token = params.get('token');
    if (!token) {
      toast.error(t('auth.googleError'));
      navigate('/login');
      return;
    }

    tokenStorage.set(token);
    httpAuthApi
      .me()
      .then((user) => {
        setSession({ user, accessToken: token });
        toast.success(t('auth.sessionStarted'));
        navigate('/');
      })
      .catch(() => {
        tokenStorage.clear();
        toast.error(t('auth.googleError'));
        navigate('/login');
      });
  }, [params, navigate, setSession, t]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      {t('auth.entering')}
    </div>
  );
}
