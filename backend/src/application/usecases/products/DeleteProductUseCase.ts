import { ErrorCode } from '@application/errors/ErrorCode';
import { NotFound } from '@application/errors/http/NotFound';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ companyId, productId }: DeleteProductUseCase.Input): Promise<void> {
    const deleted = await this.productRepository.delete(companyId, productId);

    if (!deleted) {
      throw new NotFound(ErrorCode.PRODUCT_NOT_FOUND, 'Produto não encontrado.');
    }
  }
}

export namespace DeleteProductUseCase {
  export type Input = {
    companyId: string;
    productId: string;
  };
}
