import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/authContext';
import { formatBRL } from '@/lib/money';

import type { Product } from '../api';
import { type ProductActionHandlers, ProductActions } from './ProductActions';
import { ProductImage } from './ProductImage';

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function ProductTable({ products, ...handlers }: ProductActionHandlers & { products: Product[] }) {
  const { session } = useAuth();
  const isAdmin = session?.account.role === 'admin';

  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"><span className="sr-only">Imagem</span></TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="hidden lg:table-cell">Atualizado</TableHead>
            {isAdmin && <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <TableRow key={product.id}>
              <TableCell>
                <ProductImage src={product.imageUrl} alt="" className="size-10 rounded-md" />
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate font-medium">{product.name}</p>
                <p className="truncate text-xs text-muted-foreground">{product.description}</p>
              </TableCell>
              <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
              <TableCell className="text-right font-medium tabular-nums">{formatBRL(product.priceInCents)}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {dateFormat.format(new Date(product.updatedAt))}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <ProductActions product={product} {...handlers} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
