import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';

export function AppSidebarContent() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="text-lg font-semibold">{t('app.name')}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
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
    <aside className="hidden w-60 shrink-0 border-r md:block">
      <AppSidebarContent />
    </aside>
  );
}
