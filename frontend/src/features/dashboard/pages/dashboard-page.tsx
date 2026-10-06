import { AlertTriangle, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlerts, useMarkAlertRead } from '@/features/alerts/hooks/use-alerts';
import { useAuth } from '@/features/auth/store/auth-context';
import { MonthSwitcher } from '@/shared/components/month-switcher';
import { formatMoneyLocale } from '@/shared/lib/format';
import { useDashboard } from '../hooks/use-dashboard';

interface StatCardProps {
  title: string;
  value: string;
  icon: typeof Wallet;
  trend?: number | null;
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
          {trend !== undefined && trend !== null ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              {trend >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {t('dashboard.trendVsPrevious', { percent: Math.abs(Math.round(trend * 100)) })}
            </p>
          ) : null}
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

  const currency = user?.currency;
  const unreadAlerts = alerts.filter((alert) => !alert.readAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <MonthSwitcher />
      </div>

      {isLoading || !summary ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('dashboard.balance')}
              value={formatMoneyLocale(summary.balance, currency)}
              icon={Wallet}
            />
            <StatCard
              title={t('dashboard.incomes')}
              value={formatMoneyLocale(summary.totalIncome, currency)}
              icon={ArrowDownRight}
              trend={summary.trends.income}
            />
            <StatCard
              title={t('dashboard.expenses')}
              value={formatMoneyLocale(summary.totalExpenses, currency)}
              icon={ArrowUpRight}
              trend={summary.trends.expenses}
            />
            <StatCard
              title={t('dashboard.activeAlerts')}
              value={String(summary.activeAlerts)}
              icon={AlertTriangle}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.topCategories')}</CardTitle>
              </CardHeader>
              <CardContent>
                {summary.topCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noExpenses')}</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.topCategories.map((category) => (
                      <li key={category.categoryId} className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-medium">
                          {formatMoneyLocale(category.total, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.alerts')}</CardTitle>
              </CardHeader>
              <CardContent>
                {unreadAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('dashboard.noAlerts')}</p>
                ) : (
                  <ul className="space-y-3">
                    {unreadAlerts.map((alert) => (
                      <li key={alert.id} className="flex items-start justify-between gap-3">
                        <p className="text-sm">
                          {t(`alertTypes.${alert.type}`, {
                            budgetName: alert.params.budgetName ?? '',
                            spent: formatMoneyLocale(alert.params.spentMinorUnits ?? 0, currency),
                            limit: formatMoneyLocale(alert.params.limitMinorUnits ?? 0, currency),
                          })}
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => markRead.mutate(alert.id)}>
                          {t('dashboard.markRead')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
