import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/shared/components/password-input';
import { messageFromError } from '@/shared/lib/error-message';
import { httpAuthApi } from '../api/http-auth-api';
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/auth-form.schemas';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schema = useMemo(() => createResetPasswordSchema(t), [t]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await httpAuthApi.resetPassword({ token, password: values.password });
      toast.success(t('auth.reset.success'));
      navigate('/login');
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.reset.newPassword')}</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.reset.confirmPassword')}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t('auth.reset.submit')}
      </Button>
    </form>
  );
}
