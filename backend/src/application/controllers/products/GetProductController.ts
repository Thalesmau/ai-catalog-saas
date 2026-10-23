import { Controller, PrivateController } from '@application/contracts/Controller';
import { GetProductUseCase } from '@application/usecases/products/GetProductUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetProductController extends PrivateController<GetProductController.Response> {
  constructor(private readonly getProductUseCase: GetProductUseCase) {
    super();
  }

  protected override async handle({
    auth,
    params,
  }: Controller.Request<'private', Record<string, unknown>, GetProductController.Params>): Promise<Controller.Response<GetProductController.Response>> {
    const product = await this.getProductUseCase.execute({
      companyId: auth.companyId,
      productId: params.id,
    });

    return {
      statusCode: 200,
      body: product,
    };
  }
}

export namespace GetProductController {
  export type Params = { id: string };

  export type Response = GetProductUseCase.Output;
}
