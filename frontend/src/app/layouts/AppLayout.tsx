import { Bot, LogOut, Package } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useSession } from '@/features/auth/authContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Produtos', icon: Package, end: true },
  { to: '/chat', label: 'Assistente', icon: Bot, end: false },
];

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
}

export function AppLayout() {
  const { signOut } = useAuth();
  const { account, company } = useSession();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo className="shrink-0" />
          <span className="hidden truncate text-sm text-muted-foreground md:inline">/ {company.name}</span>

          <nav className="ml-auto flex items-center gap-1" aria-label="Principal">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu da conta">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(account.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="space-y-1 font-normal">
                <p className="truncate text-sm font-medium">{account.name}</p>
                <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant={account.role === 'admin' ? 'default' : 'secondary'}>
                    {account.role === 'admin' ? 'Admin' : 'Usuário'}
                  </Badge>
                  <span className="truncate text-xs text-muted-foreground">{company.name}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut}>
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
