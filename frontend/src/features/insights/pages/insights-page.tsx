import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/store/auth-context';
import { MonthSwitcher } from '@/shared/components/month-switcher';
import { formatMoneyLocale } from '@/shared/lib/format';
import type { InsightType } from '../domain/insights';
import { useInsights } from '../hooks/use-insights';

const TYPE_STYLES: Record<InsightType, { labelKey: string; className: string }> = {
  WARNING: { labelKey: 'insights.typeLabel.WARNING', className: 'bg-destructive/10 text-destructive' },
  OPPORTUNITY: {
    labelKey: 'insights.typeLabel.OPPORTUNITY',
    className: 'bg-amber-500/10 text-amber-600',
  },
  SUCCESS: {
    labelKey: 'insights.typeLabel.SUCCESS',
    className: 'bg-emerald-500/10 text-emerald-600',
  },
};

export function InsightsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useInsights();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('insights.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('insights.description')}</p>
        </div>
        <MonthSwitcher />
      </div>

      {isLoading || !data ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('insights.observations')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('insights.noObservations')}</p>
              ) : (
                <ul className="space-y-4">
                  {data.insights.map((insight) => (
                    <li key={insight.code} className="space-y-1">
                      <Badge className={TYPE_STYLES[insight.type].className}>
                        {t(TYPE_STYLES[insight.type].labelKey)}
                      </Badge>
                      <p className="font-medium">
                        {t(`insights.codes.${insight.code}.title`, insight.params)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(`insights.codes.${insight.code}.description`, insight.params)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('insights.reviewable')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.cuttableExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('insights.noReviewable')}</p>
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
                          {expense.categoryName} · {t(`insights.reasons.${expense.reasonCode}`)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium">
                        {formatMoneyLocale(expense.amountMinorUnits, user?.currency)}
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
