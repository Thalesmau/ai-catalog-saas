import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL } from '@/lib/money';

import type { Product } from '../api';
import { type ProductActionHandlers, ProductActions } from './ProductActions';
import { ProductImage } from './ProductImage';

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export function ProductGrid({ products, ...handlers }: ProductActionHandlers & { products: Product[] }) {
  return (
    <ul className={GRID}>
      {products.map(product => (
        <li key={product.id}>
          <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
            <div className="relative">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="aspect-[3/2] w-full transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <ProductActions
                product={product}
                {...handlers}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Badge variant="secondary" className="w-fit">{product.category}</Badge>
              <h3 className="leading-snug font-medium">{product.name}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
              <p className="mt-auto pt-2 text-lg font-semibold">{formatBRL(product.priceInCents)}</p>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton() {
  return (
    <ul className={GRID} aria-label="Carregando produtos">
      {Array.from({ length: 8 }, (_, index) => (
        <li key={index}>
          <Card className="gap-0 overflow-hidden py-0">
            <Skeleton className="aspect-[3/2] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
