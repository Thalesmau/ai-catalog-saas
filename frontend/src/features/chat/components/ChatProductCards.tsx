import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/features/products/components/ProductImage';

import type { ChatProduct } from '../types';

const MAX_VISIBLE = 6;

export function ChatProductCards({ products }: { products: ChatProduct[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Produtos consultados no catálogo</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {products.slice(0, MAX_VISIBLE).map(product => (
          <li key={product.id} className="flex items-center gap-3 rounded-lg border bg-card p-2">
            <ProductImage src={product.imageUrl} alt="" className="size-14 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{product.price}</span>
                <Badge variant="secondary" className="truncate text-[10px]">{product.category}</Badge>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {products.length > MAX_VISIBLE && (
        <p className="text-xs text-muted-foreground">+{products.length - MAX_VISIBLE} produtos</p>
      )}
    </div>
  );
}
