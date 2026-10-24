import { AlertCircle, PackageOpen, Plus, SearchX } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/authContext';
import { RoleGate } from '@/features/auth/routeGuards';

import type { Product } from '../api';
import { DeleteProductDialog } from '../components/DeleteProductDialog';
import { InviteCard } from '../components/InviteCard';
import { Pagination } from '../components/Pagination';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid';
import { ProductTable } from '../components/ProductTable';
import { ProductToolbar } from '../components/ProductToolbar';
import { useCategories, useProducts } from '../hooks';
import { toApiFilters, useProductFilters } from '../useProductFilters';

type FormState = { open: boolean; product: Product | null };

function countLabel(total: number, filtered: boolean) {
  if (filtered) {
    return `${total} ${total === 1 ? 'encontrado' : 'encontrados'}`;
  }

  return `${total} ${total === 1 ? 'produto' : 'produtos'}`;
}

export function ProductsPage() {
  const { company } = useSession();
  const filters = useProductFilters();
  const products = useProducts(toApiFilters(filters));
  const categories = useCategories();

  const [form, setForm] = useState<FormState>({ open: false, product: null });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toolbarKey, setToolbarKey] = useState(0);

  const openCreate = () => setForm({ open: true, product: null });
  const openEdit = (product: Product) => setForm({ open: true, product });

  const clearFilters = () => {
    filters.reset();
    setToolbarKey(key => key + 1);
  };

  const data = products.data;
  const isEmptyCatalog = data?.total === 0 && !filters.hasFilters;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo da {company.name}
            {data && ` · ${countLabel(data.total, filters.hasFilters)}`}
          </p>
        </div>
        <RoleGate role="admin">
          <Button onClick={openCreate}>
            <Plus />
            Novo produto
          </Button>
        </RoleGate>
      </header>

      {company.inviteCode && (
        <RoleGate role="admin">
          <InviteCard inviteCode={company.inviteCode} />
        </RoleGate>
      )}

      {!isEmptyCatalog && (
        <ProductToolbar
          key={toolbarKey}
          search={filters.search}
          category={filters.category}
          sortBy={filters.sortBy}
          view={filters.view}
          categories={categories.data ?? []}
          onChange={filters.update}
        />
      )}

      {products.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar os produtos"
          description={products.error.message}
          action={<Button variant="outline" onClick={() => products.refetch()}>Tentar novamente</Button>}
        />
      ) : !data ? (
        <ProductGridSkeleton />
      ) : isEmptyCatalog ? (
        <EmptyState
          icon={PackageOpen}
          title="Nenhum produto ainda"
          description="Quando houver produtos cadastrados, eles aparecem aqui e ficam disponíveis para o assistente."
          action={(
            <RoleGate role="admin">
              <Button onClick={openCreate}>
                <Plus />
                Cadastrar o primeiro produto
              </Button>
            </RoleGate>
          )}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum produto encontrado"
          description="Tente outro termo de busca ou remova os filtros."
          action={<Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>}
        />
      ) : (
        <div className={products.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          {filters.view === 'table' ? (
            <>
              <div className="hidden md:block">
                <ProductTable products={data.items} onEdit={openEdit} onDelete={setProductToDelete} />
              </div>
              <div className="md:hidden">
                <ProductGrid products={data.items} onEdit={openEdit} onDelete={setProductToDelete} />
              </div>
            </>
          ) : (
            <ProductGrid products={data.items} onEdit={openEdit} onDelete={setProductToDelete} />
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={page => filters.update({ page })}
        />
      )}

      <ProductFormDialog
        open={form.open}
        product={form.product}
        categories={categories.data ?? []}
        onOpenChange={open => setForm(current => ({ ...current, open }))}
      />
      <DeleteProductDialog product={productToDelete} onClose={() => setProductToDelete(null)} />
    </div>
  );
}
