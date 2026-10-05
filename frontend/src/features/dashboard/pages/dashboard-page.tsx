import { AlertTriangle, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlerts, useMarkAlertRead } from '@/features/alerts/hooks/use-alerts';
import { useAuth } from '@/features/auth/store/auth-context';
import { formatMoney } from '@/shared/lib/money';
import { useDashboard } from '../hooks/use-dashboard';

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: summary, isLoading } = useDashboard();
  const { data: alerts = [] } = useAlerts();
  const markRead = useMarkAlertRead();

  if (isLoading || !summary) {
    return <p className="text-muted-foreground">Cargando…</p>;
  }

  const currency = user?.currency;
  const unreadAlerts = alerts.filter((alert) => !alert.readAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('pages.dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">Balance del mes de {summary.month}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Balance"
          value={formatMoney(summary.balance, currency)}
          icon={Wallet}
        />
        <StatCard
          title="Ingresos"
          value={formatMoney(summary.totalIncome, currency)}
          icon={ArrowDownRight}
        />
        <StatCard
          title="Gastos"
          value={formatMoney(summary.totalExpenses, currency)}
          icon={ArrowUpRight}
        />
        <StatCard
          title="Alertas activas"
          value={String(summary.activeAlerts)}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top categorías de gasto</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin gastos este mes todavía.</p>
            ) : (
              <ul className="space-y-3">
                {summary.topCategories.map((category) => (
                  <li key={category.categoryId} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-sm font-medium">
                      {formatMoney(category.total, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            {unreadAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes alertas pendientes. ¡Bien hecho!</p>
            ) : (
              <ul className="space-y-3">
                {unreadAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-start justify-between gap-3">
                    <p className="text-sm">{alert.message}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate(alert.id)}
                    >
                      Marcar leída
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
