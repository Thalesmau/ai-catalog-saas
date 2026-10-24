import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import type { ProductFilters, SortBy } from './api';

const PAGE_SIZE = 12;
const SORT_OPTIONS: SortBy[] = ['newest', 'price_asc', 'price_desc', 'name'];

export type View = 'grid' | 'table';

type FilterState = {
  search: string;
  category: string;
  sortBy: SortBy;
  page: number;
  view: View;
};

export function useProductFilters() {
  const [params, setParams] = useSearchParams();

  const state = useMemo<FilterState>(() => {
    const sortBy = params.get('sort') as SortBy | null;
    const page = Number(params.get('page'));

    return {
      search: params.get('q') ?? '',
      category: params.get('category') ?? '',
      sortBy: sortBy && SORT_OPTIONS.includes(sortBy) ? sortBy : 'newest',
      page: Number.isInteger(page) && page > 0 ? page : 1,
      view: params.get('view') === 'table' ? 'table' : 'grid',
    };
  }, [params]);

  const update = useCallback((changes: Partial<FilterState>) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      const entries: [keyof FilterState, string, string | number | undefined][] = [
        ['search', 'q', changes.search],
        ['category', 'category', changes.category],
        ['sortBy', 'sort', changes.sortBy],
        ['page', 'page', changes.page],
        ['view', 'view', changes.view],
      ];

      for (const [key, param, value] of entries) {
        if (!(key in changes)) {
          continue;
        }

        const isDefault = value === '' || value === undefined || value === 1 || value === 'newest' || value === 'grid';

        if (isDefault) {
          next.delete(param);
        } else {
          next.set(param, String(value));
        }
      }

      if (!('page' in changes) && ('search' in changes || 'category' in changes || 'sortBy' in changes)) {
        next.delete('page');
      }

      return next;
    }, { replace: true });
  }, [setParams]);

  const reset = useCallback(() => {
    setParams(current => (current.get('view') ? new URLSearchParams({ view: current.get('view')! }) : new URLSearchParams()), {
      replace: true,
    });
  }, [setParams]);

  return { ...state, update, reset, hasFilters: Boolean(state.search || state.category) };
}

export function toApiFilters({ search, category, sortBy, page }: FilterState): ProductFilters {
  return {
    search: search.trim() || undefined,
    category: category || undefined,
    sortBy,
    page,
    pageSize: PAGE_SIZE,
  };
}
