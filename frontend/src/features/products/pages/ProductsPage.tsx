import { useSession } from '@/features/auth/authContext';

export function ProductsPage() {
  const { account, company } = useSession();

  return (
    <section className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
      <p className="text-muted-foreground">
        Olá, {account.name}. Catálogo da {company.name} em construção.
      </p>
    </section>
  );
}
