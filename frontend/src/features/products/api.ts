import { http } from '@/lib/http';

export type Product = {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'name';

export type ProductFilters = {
  search?: string;
  category?: string;
  sortBy: SortBy;
  page: number;
  pageSize: number;
};

export type ProductPage = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CategorySummary = {
  category: string;
  productCount: number;
  minPriceInCents: number;
  maxPriceInCents: number;
};

export type ProductInput = {
  name: string;
  description: string;
  priceInCents: number;
  category: string;
  imageUrl: string | null;
};

export const productsApi = {
  list: (filters: ProductFilters, signal?: AbortSignal) => http<ProductPage>('/products', { query: filters, signal }),
  categories: () => http<{ categories: CategorySummary[] }>('/products/categories'),
  create: (input: ProductInput) => http<Product>('/products', { method: 'POST', body: input }),
  update: (id: string, input: Partial<ProductInput>) => http<Product>(`/products/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => http<void>(`/products/${id}`, { method: 'DELETE' }),
};
