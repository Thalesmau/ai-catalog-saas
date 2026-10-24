import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/features/auth/authContext';

import { type ProductFilters, type ProductInput, productsApi } from './api';

export function useProductKeys() {
  const { company } = useSession();
  const all = ['products', company.id] as const;

  return {
    all,
    list: (filters: ProductFilters) => [...all, 'list', filters] as const,
    categories: [...all, 'categories'] as const,
  };
}

export function useProducts(filters: ProductFilters) {
  const keys = useProductKeys();

  return useQuery({
    queryKey: keys.list(filters),
    queryFn: ({ signal }) => productsApi.list(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  const keys = useProductKeys();

  return useQuery({
    queryKey: keys.categories,
    queryFn: productsApi.categories,
    select: data => data.categories,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const keys = useProductKeys();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: keys.all });

  const create = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      toast.success(`"${product.name}" criado.`);
      return invalidate();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => productsApi.update(id, input),
    onSuccess: (product) => {
      toast.success(`"${product.name}" atualizado.`);
      return invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (product: { id: string; name: string }) => productsApi.remove(product.id),
    onSuccess: (_data, product) => {
      toast.success(`"${product.name}" excluído.`);
      return invalidate();
    },
    onError: error => toast.error(error.message),
  });

  return { create, update, remove };
}
