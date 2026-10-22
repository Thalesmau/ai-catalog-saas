import { Controller, PublicController } from '@application/contracts/Controller';
import { GetHealthUseCase } from '@application/usecases/health/GetHealthUseCase';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetHealthController extends PublicController<GetHealthController.Response> {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {
    super();
  }

  protected override async handle(): Promise<Controller.Response<GetHealthController.Response>> {
    const health = await this.getHealthUseCase.execute();

    return {
      statusCode: health.status === 'ok' ? 200 : 503,
      body: health,
    };
  }
}

export namespace GetHealthController {
  export type Response = GetHealthUseCase.Output;
}
