import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Paginação">
      <p className="text-sm text-muted-foreground">
        {first}–{last} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
        <span className="text-sm tabular-nums">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
