import { Controller, PrivateController } from '@application/contracts/Controller';
import { DeleteProductUseCase } from '@application/usecases/products/DeleteProductUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class DeleteProductController extends PrivateController {
  constructor(private readonly deleteProductUseCase: DeleteProductUseCase) {
    super();
  }

  protected override async handle({
    auth,
    params,
  }: Controller.Request<'private', Record<string, unknown>, DeleteProductController.Params>): Promise<Controller.Response> {
    await this.deleteProductUseCase.execute({
      companyId: auth.companyId,
      productId: params.id,
    });

    return { statusCode: 204 };
  }
}

export namespace DeleteProductController {
  export type Params = { id: string };
}
