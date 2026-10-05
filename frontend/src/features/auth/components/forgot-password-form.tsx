import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { messageFromError } from '@/shared/lib/error-message';
import { httpAuthApi } from '../api/http-auth-api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth-form.schemas';

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const [sent, setSent] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await httpAuthApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        Si el correo existe, recibirás un enlace para restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Enviar enlace
      </Button>
    </form>
  );
}
