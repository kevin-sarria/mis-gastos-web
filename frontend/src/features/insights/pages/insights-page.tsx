import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/store/auth-context';
import { MonthSwitcher } from '@/shared/components/month-switcher';
import { formatMoney } from '@/shared/lib/money';
import type { InsightType } from '../domain/insights';
import { useInsights } from '../hooks/use-insights';

const TYPE_STYLES: Record<InsightType, { label: string; className: string }> = {
  WARNING: { label: 'Atención', className: 'bg-destructive/10 text-destructive' },
  OPPORTUNITY: { label: 'Por revisar', className: 'bg-amber-500/10 text-amber-600' },
  SUCCESS: { label: 'Positivo', className: 'bg-emerald-500/10 text-emerald-600' },
};

export function InsightsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useInsights();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('pages.insights.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.insights.description')}</p>
        </div>
        <MonthSwitcher />
      </div>

      {isLoading || !data ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Observaciones del mes</CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay nada que observar este mes.
                </p>
              ) : (
                <ul className="space-y-4">
                  {data.insights.map((insight) => (
                    <li key={insight.title} className="space-y-1">
                      <Badge className={TYPE_STYLES[insight.type].className}>
                        {TYPE_STYLES[insight.type].label}
                      </Badge>
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gastos que podrías revisar</CardTitle>
            </CardHeader>
            <CardContent>
              {data.cuttableExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay gastos no esenciales registrados este mes.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.cuttableExpenses.map((expense, index) => (
                    <li
                      key={`${expense.title}-${index}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.categoryName} · {expense.reason}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium">
                        {formatMoney(expense.amountMinorUnits, user?.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
