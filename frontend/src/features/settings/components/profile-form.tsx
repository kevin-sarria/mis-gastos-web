import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { useCurrencies } from '@/features/auth/hooks/use-currencies';
import { useUpdateProfile } from '@/features/auth/hooks/use-profile';
import { createProfileSchema, type ProfileFormValues } from '@/features/auth/schemas/profile.schemas';
import { useAuth } from '@/features/auth/store/auth-context';
import { messageFromError } from '@/shared/lib/error-message';

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();
  const updateProfile = useUpdateProfile();

  const schema = useMemo(() => createProfileSchema(t), [t]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      currencyCode: user?.currencyCode ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await updateProfile.mutateAsync(values);
      updateUser(updated);
      toast.success(t('auth.profile.updated'));
    } catch (error) {
      toast.error(messageFromError(error, t));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="profile-name">{t('auth.profile.name')}</Label>
        <Input id="profile-name" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t('auth.profile.currency')}</Label>
        <Select
          value={form.watch('currencyCode')}
          onValueChange={(value) => form.setValue('currencyCode', value, { shouldValidate: true })}
        >
          <SelectTrigger id="profile-currency" className="w-full">
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
        <p className="text-xs text-muted-foreground">{t('auth.profile.currencyWarning')}</p>
        {form.formState.errors.currencyCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.currencyCode.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting || currenciesLoading}>
        {t('common.saveChanges')}
      </Button>
    </form>
  );
}
