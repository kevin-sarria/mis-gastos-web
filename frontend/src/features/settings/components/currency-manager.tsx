import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { messageFromError } from '@/shared/lib/error-message';
import { httpCurrencyAdminApi } from '../api/currency-api';

const currencyFormSchema = z.object({
  code: z.string().trim().toUpperCase().length(3, 'Código de 3 letras'),
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80),
  symbol: z.string().trim().min(1, 'Escribe un símbolo').max(10),
  minorUnits: z.number().int().min(0).max(4),
});

type CurrencyFormValues = z.infer<typeof currencyFormSchema>;

export function CurrencyManager() {
  const queryClient = useQueryClient();
  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies', 'all'],
    queryFn: () => httpCurrencyAdminApi.listAll(),
  });

  const createCurrency = useMutation({
    mutationFn: (input: CurrencyFormValues) => httpCurrencyAdminApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currencies'] }),
  });

  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencyFormSchema),
    defaultValues: { code: '', name: '', symbol: '', minorUnits: 2 },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createCurrency.mutateAsync(values);
      toast.success('Moneda creada');
      form.reset();
    } catch (error) {
      toast.error(messageFromError(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monedas (administrador)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ul className="divide-y">
          {currencies.map((currency) => (
            <li key={currency.code} className="flex items-center justify-between py-2">
              <span className="text-sm">
                {currency.code} — {currency.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {currency.symbol} · {currency.minorUnits} decimales
              </span>
            </li>
          ))}
        </ul>

        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2" noValidate>
          <div className="space-y-1">
            <Label htmlFor="code">Código ISO</Label>
            <Input id="code" placeholder="EUR" {...form.register('code')} />
            {form.formState.errors.code ? (
              <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Euro" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="symbol">Símbolo</Label>
            <Input id="symbol" placeholder="€" {...form.register('symbol')} />
            {form.formState.errors.symbol ? (
              <p className="text-sm text-destructive">{form.formState.errors.symbol.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="minorUnits">Decimales</Label>
            <Input
              id="minorUnits"
              type="number"
              min={0}
              max={4}
              {...form.register('minorUnits', { valueAsNumber: true })}
            />
            {form.formState.errors.minorUnits ? (
              <p className="text-sm text-destructive">{form.formState.errors.minorUnits.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="sm:col-span-2">
            Añadir moneda
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
