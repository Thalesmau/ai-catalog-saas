import { Controller, PrivateController } from '@application/contracts/Controller';
import { CreateProductUseCase } from '@application/usecases/products/CreateProductUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

import { CreateProductBody, createProductSchema } from './schemas/productSchemas';

@Injectable()
@Schema(createProductSchema)
export class CreateProductController extends PrivateController<CreateProductController.Response> {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {
    super();
  }

  protected override async handle({
    auth,
    body,
  }: Controller.Request<'private', CreateProductBody>): Promise<Controller.Response<CreateProductController.Response>> {
    const product = await this.createProductUseCase.execute({
      companyId: auth.companyId,
      data: body,
    });

    return {
      statusCode: 201,
      body: product,
    };
  }
}

export namespace CreateProductController {
  export type Response = CreateProductUseCase.Output;
}
