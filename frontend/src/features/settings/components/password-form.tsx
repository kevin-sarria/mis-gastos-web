import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/features/auth/hooks/use-profile';
import {
  createPasswordChangeSchema,
  type PasswordChangeFormValues,
} from '@/features/auth/schemas/profile.schemas';
import { PasswordInput } from '@/shared/components/password-input';
import { messageFromError } from '@/shared/lib/error-message';

export function PasswordForm() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();

  const schema = useMemo(() => createPasswordChangeSchema(t), [t]);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(t('auth.passwordChange.updated'));
      form.reset();
      form.clearErrors();
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t('auth.passwordChange.current')}</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          {...form.register('currentPassword')}
        />
        {form.formState.errors.currentPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t('auth.passwordChange.new')}</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          {...form.register('newPassword')}
        />
        {form.formState.errors.newPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.passwordChange.confirm')}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {t('auth.passwordChange.submit')}
      </Button>
    </form>
  );
}
