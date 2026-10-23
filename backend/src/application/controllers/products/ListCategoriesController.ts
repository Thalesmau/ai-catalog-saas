import { Controller, PrivateController } from '@application/contracts/Controller';
import { ListCategoriesUseCase } from '@application/usecases/products/ListCategoriesUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class ListCategoriesController extends PrivateController<ListCategoriesController.Response> {
  constructor(private readonly listCategoriesUseCase: ListCategoriesUseCase) {
    super();
  }

  protected override async handle({
    auth,
  }: Controller.Request<'private'>): Promise<Controller.Response<ListCategoriesController.Response>> {
    const result = await this.listCategoriesUseCase.execute({ companyId: auth.companyId });

    return {
      statusCode: 200,
      body: result,
    };
  }
}

export namespace ListCategoriesController {
  export type Response = ListCategoriesUseCase.Output;
}
