import { ErrorCode } from '../ErrorCode';
import { ApplicationError } from './ApplicationError';

export class EmailAlreadyInUse extends ApplicationError {
  public override statusCode = 409;
  public override code = ErrorCode.EMAIL_ALREADY_IN_USE;

  constructor() {
    super();

    this.name = 'EmailAlreadyInUse';
    this.message = 'Este email já está em uso.';
  }
}
