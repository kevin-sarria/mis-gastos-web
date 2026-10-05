import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { tokenStorage } from '@/core/http/token-storage';
import { httpAuthApi } from '../api/http-auth-api';
import { useAuth } from '../store/auth-context';

export function GoogleCallbackPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;

    const token = params.get('token');
    if (!token) {
      toast.error('No se pudo completar el inicio con Google');
      navigate('/login');
      return;
    }

    tokenStorage.set(token);
    httpAuthApi
      .me()
      .then((user) => {
        setSession({ user, accessToken: token });
        toast.success('Sesión iniciada');
        navigate('/');
      })
      .catch(() => {
        tokenStorage.clear();
        toast.error('No se pudo completar el inicio con Google');
        navigate('/login');
      });
  }, [params, navigate, setSession]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Entrando…
    </div>
  );
}
