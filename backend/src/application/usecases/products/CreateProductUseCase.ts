import { Product } from '@application/entities/Product';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId, data }: CreateProductUseCase.Input): Promise<CreateProductUseCase.Output> {
    const product = await this.productRepository.create(companyId, data);

    return product.toPublic();
  }
}

export namespace CreateProductUseCase {
  export type Input = {
    companyId: string;
    data: ProductRepository.CreateInput;
  };

  export type Output = Product.Public;
}
