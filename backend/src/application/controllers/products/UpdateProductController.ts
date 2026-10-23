import { Controller, PrivateController } from '@application/contracts/Controller';
import { UpdateProductUseCase } from '@application/usecases/products/UpdateProductUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

import { UpdateProductBody, updateProductSchema } from './schemas/productSchemas';

@Injectable()
@Schema(updateProductSchema)
export class UpdateProductController extends PrivateController<UpdateProductController.Response> {
  constructor(private readonly updateProductUseCase: UpdateProductUseCase) {
    super();
  }

  protected override async handle({
    auth,
    body,
    params,
  }: Controller.Request<'private', UpdateProductBody, UpdateProductController.Params>): Promise<Controller.Response<UpdateProductController.Response>> {
    const product = await this.updateProductUseCase.execute({
      companyId: auth.companyId,
      productId: params.id,
      data: body,
    });

    return {
      statusCode: 200,
      body: product,
    };
  }
}

export namespace UpdateProductController {
  export type Params = { id: string };

  export type Response = UpdateProductUseCase.Output;
}
