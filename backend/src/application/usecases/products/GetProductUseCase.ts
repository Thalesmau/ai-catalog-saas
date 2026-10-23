import { Product } from '@application/entities/Product';
import { ErrorCode } from '@application/errors/ErrorCode';
import { NotFound } from '@application/errors/http/NotFound';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId, productId }: GetProductUseCase.Input): Promise<GetProductUseCase.Output> {
    const product = await this.productRepository.findById(companyId, productId);

    if (!product) {
      throw new NotFound(ErrorCode.PRODUCT_NOT_FOUND, 'Produto não encontrado.');
    }

    return product.toPublic();
  }
}

export namespace GetProductUseCase {
  export type Input = {
    companyId: string;
    productId: string;
  };

  export type Output = Product.Public;
}
