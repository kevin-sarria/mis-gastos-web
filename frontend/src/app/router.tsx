import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/login-page';
import { RegisterPage } from '@/features/auth/pages/register-page';
import { BudgetsPage } from '@/features/budgets/pages/budgets-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { ExpensesPage } from '@/features/expenses/pages/expenses-page';
import { IncomesPage } from '@/features/incomes/pages/incomes-page';
import { InsightsPage } from '@/features/insights/pages/insights-page';
import { SettingsPage } from '@/features/settings/pages/settings-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { AppLayout } from '@/shared/components/layout/app-layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'ingresos', element: <IncomesPage /> },
      { path: 'gastos', element: <ExpensesPage /> },
      { path: 'presupuestos', element: <BudgetsPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
