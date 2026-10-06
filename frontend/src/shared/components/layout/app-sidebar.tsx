import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';

export function AppSidebarContent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-3 px-1 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-base font-semibold tracking-tight">{t('app.name')}</span>
          <span className="truncate text-[11px] text-muted-foreground">{t('app.tagline')}</span>
        </span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/12 font-semibold text-primary'
                    : 'font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 overflow-y-auto border-r bg-sidebar md:block">
      <AppSidebarContent />
    </aside>
  );
}
