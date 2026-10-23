import { Controller, PrivateController } from '@application/contracts/Controller';
import { GetMeUseCase } from '@application/usecases/auth/GetMeUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetMeController extends PrivateController<GetMeController.Response> {
  constructor(private readonly getMeUseCase: GetMeUseCase) {
    super();
  }

  protected override async handle({
    auth,
  }: Controller.Request<'private'>): Promise<Controller.Response<GetMeController.Response>> {
    const me = await this.getMeUseCase.execute({
      companyId: auth.companyId,
      accountId: auth.accountId,
    });

    return {
      statusCode: 200,
      body: me,
    };
  }
}

export namespace GetMeController {
  export type Response = GetMeUseCase.Output;
}
