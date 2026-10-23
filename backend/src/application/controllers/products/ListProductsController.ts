import { Controller, PrivateController } from '@application/contracts/Controller';
import { ListProductsUseCase } from '@application/usecases/products/ListProductsUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

import { listProductsQuerySchema } from './schemas/productSchemas';

@Injectable()
export class ListProductsController extends PrivateController<ListProductsController.Response> {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {
    super();
  }

  protected override async handle({
    auth,
    queryParams,
  }: Controller.Request<'private'>): Promise<Controller.Response<ListProductsController.Response>> {
    const filters = listProductsQuerySchema.parse(queryParams);

    const result = await this.listProductsUseCase.execute({
      companyId: auth.companyId,
      ...filters,
    });

    return {
      statusCode: 200,
      body: result,
    };
  }
}

export namespace ListProductsController {
  export type Response = ListProductsUseCase.Output;
}
