import { Controller, PublicController } from '@application/contracts/Controller';
import { SignUpUseCase } from '@application/usecases/auth/SignUpUseCase';
import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';

import { SignUpBody, signUpSchema } from './schemas/signUpSchema';

@Injectable()
@Schema(signUpSchema)
export class SignUpController extends PublicController<SignUpController.Response> {
  constructor(private readonly signUpUseCase: SignUpUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'public', SignUpBody>): Promise<Controller.Response<SignUpController.Response>> {
    const { name, email, password, companyName, inviteCode } = body;

    const input: SignUpUseCase.Input = companyName
      ? { name, email, password, companyName }
      : { name, email, password, inviteCode: inviteCode ?? '' };

    const session = await this.signUpUseCase.execute(input);

    return {
      statusCode: 201,
      body: session,
    };
  }
}

export namespace SignUpController {
  export type Response = SignUpUseCase.Output;
}
