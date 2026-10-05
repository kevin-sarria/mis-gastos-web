import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/ingresos', labelKey: 'nav.incomes', icon: Wallet },
  { to: '/gastos', labelKey: 'nav.expenses', icon: Receipt },
  { to: '/presupuestos', labelKey: 'nav.budgets', icon: PiggyBank },
  { to: '/insights', labelKey: 'nav.insights', icon: TrendingUp },
  { to: '/ajustes', labelKey: 'nav.settings', icon: Settings },
];
