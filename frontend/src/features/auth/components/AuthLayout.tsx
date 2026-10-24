import { Bot, Building2, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const HIGHLIGHTS = [
  { icon: Building2, text: 'Cada empresa com seu catálogo isolado' },
  { icon: ShieldCheck, text: 'Admins gerenciam, usuários consultam' },
  { icon: Bot, text: 'Assistente de IA que responde com dados reais do catálogo' },
];

export function AuthLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-zinc-50 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 size-[32rem] rounded-full bg-violet-600/30 blur-3xl"
        />
        <Logo className="relative" />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Seu catálogo de produtos, com um assistente que conhece cada item.
          </h2>
          <ul className="space-y-3 text-zinc-300">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon className="size-5 text-violet-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-zinc-500">Catálogo multi-empresa com assistente de IA</p>
      </aside>

      <main className="flex flex-col p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm space-y-6">
            <header className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </header>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
