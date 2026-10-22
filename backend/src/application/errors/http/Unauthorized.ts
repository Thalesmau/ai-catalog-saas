import { ErrorCode } from '../ErrorCode';
import { HttpError } from './HttpError';

export class Unauthorized extends HttpError {
  public override statusCode = 401;
  public override code: ErrorCode;

  constructor(code?: ErrorCode, message?: string) {
    super();

    this.name = 'Unauthorized';
    this.message = message ?? 'Unauthorized.';
    this.code = code ?? ErrorCode.UNAUTHORIZED;
  }
}
