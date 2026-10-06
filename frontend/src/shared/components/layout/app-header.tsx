import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { AppSidebarContent } from './app-sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('auth.openMenu')}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">{t('auth.navigationMenu')}</SheetTitle>
          <AppSidebarContent />
        </SheetContent>
      </Sheet>
      <div className="flex-1" />
      <LanguageSwitcher />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
