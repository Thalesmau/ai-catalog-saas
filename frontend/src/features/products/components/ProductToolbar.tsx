import { LayoutGrid, Search, Table2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

import type { CategorySummary, SortBy } from '../api';
import type { View } from '../useProductFilters';

const ALL_CATEGORIES = '__all__';

const SORT_LABELS: Record<SortBy, string> = {
  newest: 'Mais recentes',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  name: 'Nome (A-Z)',
};

type ProductToolbarProps = {
  search: string;
  category: string;
  sortBy: SortBy;
  view: View;
  categories: CategorySummary[];
  onChange: (changes: { search?: string; category?: string; sortBy?: SortBy; view?: View }) => void;
};

export function ProductToolbar({ search, category, sortBy, view, categories, onChange }: ProductToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(search);
  const debouncedSearch = useDebouncedValue(searchDraft);

  useEffect(() => {
    if (debouncedSearch !== search) {
      onChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, search, onChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchDraft}
          onChange={event => setSearchDraft(event.target.value)}
          placeholder="Buscar por nome, descrição ou categoria"
          aria-label="Buscar produtos"
          className="pl-9"
          maxLength={100}
        />
        {searchDraft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            onClick={() => setSearchDraft('')}
            aria-label="Limpar busca"
          >
            <X />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex">
        <Select
          value={category || ALL_CATEGORIES}
          onValueChange={value => onChange({ category: value === ALL_CATEGORIES ? '' : value })}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por categoria">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Categorias</SelectItem>
            {categories.map(item => (
              <SelectItem key={item.category} value={item.category}>
                {item.category} ({item.productCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={value => onChange({ sortBy: value as SortBy })}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        value={view}
        onValueChange={value => value && onChange({ view: value as View })}
        className="hidden md:flex"
        aria-label="Modo de visualização"
      >
        <ToggleGroupItem value="grid" aria-label="Grade">
          <LayoutGrid />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Tabela">
          <Table2 />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
