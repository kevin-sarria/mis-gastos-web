import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { messageFromError } from '@/shared/lib/error-message';
import { httpAuthApi } from '../api/http-auth-api';
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/auth-form.schemas';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);

  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await httpAuthApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  if (sent) {
    return <p className="text-sm text-muted-foreground">{t('auth.forgot.sent')}</p>;
  }

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
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {t('auth.forgot.submit')}
      </Button>
    </form>
  );
}
