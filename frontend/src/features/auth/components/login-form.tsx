import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/shared/components/password-input';
import { messageFromError } from '@/shared/lib/error-message';
import { createLoginSchema, type LoginFormValues } from '../schemas/auth-form.schemas';
import { useAuth } from '../store/auth-context';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      toast.success(t('auth.sessionStarted'));
      navigate('/');
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t('auth.signInSubmit')}
      </Button>
    </form>
  );
}
