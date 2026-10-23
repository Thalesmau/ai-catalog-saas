import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId }: ListCategoriesUseCase.Input): Promise<ListCategoriesUseCase.Output> {
    const categories = await this.productRepository.listCategories(companyId);

    return { categories };
  }
}

export namespace ListCategoriesUseCase {
  export type Input = {
    companyId: string;
  };

  export type Output = {
    categories: ProductRepository.CategorySummary[];
  };
}
