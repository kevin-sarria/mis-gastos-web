import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { messageFromError } from '@/shared/lib/error-message';
import { useCurrencies } from '@/features/auth/hooks/use-currencies';
import { useUpdateProfile } from '@/features/auth/hooks/use-profile';
import { profileSchema, type ProfileFormValues } from '@/features/auth/schemas/profile.schemas';
import { useAuth } from '@/features/auth/store/auth-context';

export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrencies();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      currencyCode: user?.currencyCode ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await updateProfile.mutateAsync(values);
      updateUser(updated);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Nombre</Label>
        <Input id="profile-name" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Moneda</Label>
        <Select
          value={form.watch('currencyCode')}
          onValueChange={(value) => form.setValue('currencyCode', value, { shouldValidate: true })}
        >
          <SelectTrigger id="profile-currency" className="w-full">
            <SelectValue placeholder="Elige tu moneda" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} — {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Cambiar la moneda no convierte los importes ya registrados.
        </p>
        {form.formState.errors.currencyCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.currencyCode.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting || currenciesLoading}>
        Guardar cambios
      </Button>
    </form>
  );
}
