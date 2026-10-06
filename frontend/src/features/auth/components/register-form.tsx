import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PasswordInput } from '@/shared/components/password-input';
import { messageFromError } from '@/shared/lib/error-message';
import { useCurrencies } from '../hooks/use-currencies';
import { createRegisterSchema, type RegisterFormValues } from '../schemas/auth-form.schemas';
import { useAuth } from '../store/auth-context';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    isError: currenciesError,
  } = useCurrencies();

  const schema = useMemo(() => createRegisterSchema(t), [t]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', currencyCode: '' },
  });

  const currenciesUnavailable = currenciesError || (!currenciesLoading && currencies.length === 0);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        currencyCode: values.currencyCode,
      });
      toast.success(t('auth.accountCreated'));
      navigate('/');
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">{t('auth.name')}</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder={t('auth.namePlaceholder')}
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t('auth.currency')}</Label>
        {currenciesLoading ? (
          <p className="text-sm text-muted-foreground">{t('auth.loadingCurrencies')}</p>
        ) : currenciesUnavailable ? (
          <p className="text-sm text-destructive">{t('auth.currencyLoadError')}</p>
        ) : (
          <Select
            value={form.watch('currencyCode')}
            onValueChange={(value) =>
              form.setValue('currencyCode', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="currencyCode" className="w-full">
              <SelectValue placeholder={t('auth.currencyPlaceholder')} />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} — {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {form.formState.errors.currencyCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.currencyCode.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting || currenciesUnavailable}
      >
        {t('auth.createAccountSubmit')}
      </Button>
    </form>
  );
}
