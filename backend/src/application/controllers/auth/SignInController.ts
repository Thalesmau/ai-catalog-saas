import { Controller, PublicController } from '@application/contracts/Controller';
import { SignInUseCase } from '@application/usecases/auth/SignInUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

import { SignInBody, signInSchema } from './schemas/signInSchema';

@Injectable()
@Schema(signInSchema)
export class SignInController extends PublicController<SignInController.Response> {
  constructor(private readonly signInUseCase: SignInUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'public', SignInBody>): Promise<Controller.Response<SignInController.Response>> {
    const session = await this.signInUseCase.execute(body);

    return {
      statusCode: 200,
      body: session,
    };
  }
}

export namespace SignInController {
  export type Response = SignInUseCase.Output;
}
