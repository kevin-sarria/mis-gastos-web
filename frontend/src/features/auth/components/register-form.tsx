import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import type { Currency } from '@/shared/domain/currency';
import { messageFromError } from '@/shared/lib/error-message';
import { httpAuthApi } from '../api/http-auth-api';
import { registerSchema, type RegisterFormValues } from '../schemas/auth-form.schemas';
import { useAuth } from '../store/auth-context';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', currencyCode: '' },
  });

  useEffect(() => {
    httpAuthApi
      .getCurrencies()
      .then(setCurrencies)
      .catch(() => setCurrencies([]));
  }, []);

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
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repite la contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Moneda</Label>
        <Select
          value={form.watch('currencyCode')}
          onValueChange={(value) => form.setValue('currencyCode', value, { shouldValidate: true })}
        >
          <SelectTrigger id="currencyCode">
            <SelectValue placeholder="Elige tu moneda" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} — {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.currencyCode ? (
          <p className="text-sm text-destructive">{form.formState.errors.currencyCode.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
}
