import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '../components/reset-password-form';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>Elige una nueva contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-muted-foreground">
              El enlace no es válido. Solicita uno nuevo desde la pantalla de recuperación.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
