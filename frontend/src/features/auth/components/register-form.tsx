import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/shared/components/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { messageFromError } from '@/shared/lib/error-message';
import { useCurrencies } from '../hooks/use-currencies';
import { registerSchema, type RegisterFormValues } from '../schemas/auth-form.schemas';
import { useAuth } from '../store/auth-context';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    data: currencies = [],
    isLoading: currenciesLoading,
    isError: currenciesError,
  } = useCurrencies();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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
      toast.success('Cuenta creada');
      navigate('/');
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" autoComplete="name" placeholder="Tu nombre" {...form.register('name')} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
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
        <Label htmlFor="confirmPassword">Repite la contraseña</Label>
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
        <Label>Moneda</Label>
        {currenciesLoading ? (
          <p className="text-sm text-muted-foreground">Cargando monedas…</p>
        ) : currenciesUnavailable ? (
          <p className="text-sm text-destructive">
            No se pudieron cargar las monedas. Comprueba que el backend esté en marcha.
          </p>
        ) : (
          <Select
            value={form.watch('currencyCode')}
            onValueChange={(value) =>
              form.setValue('currencyCode', value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="currencyCode" className="w-full">
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
        Crear cuenta
      </Button>
    </form>
  );
}
