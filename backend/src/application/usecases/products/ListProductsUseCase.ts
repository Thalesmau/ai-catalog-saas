import { Product } from '@application/entities/Product';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId, ...filters }: ListProductsUseCase.Input): Promise<ListProductsUseCase.Output> {
    const { items, total } = await this.productRepository.list(companyId, filters);

    return {
      items: items.map(product => product.toPublic()),
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    };
  }
}

export namespace ListProductsUseCase {
  export type Input = ProductRepository.ListFilters & {
    companyId: string;
  };

  export type Output = {
    items: Product.Public[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
