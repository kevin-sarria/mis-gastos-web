import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebarContent } from './app-sidebar';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <AppSidebarContent />
        </SheetContent>
      </Sheet>
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
