import { Product } from '@application/entities/Product';
import { ErrorCode } from '@application/errors/ErrorCode';
import { NotFound } from '@application/errors/http/NotFound';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId, productId, data }: UpdateProductUseCase.Input): Promise<UpdateProductUseCase.Output> {
    const product = await this.productRepository.update(companyId, productId, data);

    if (!product) {
      throw new NotFound(ErrorCode.PRODUCT_NOT_FOUND, 'Produto não encontrado.');
    }

    return product.toPublic();
  }
}

export namespace UpdateProductUseCase {
  export type Input = {
    companyId: string;
    productId: string;
    data: ProductRepository.UpdateInput;
  };

  export type Output = Product.Public;
}
