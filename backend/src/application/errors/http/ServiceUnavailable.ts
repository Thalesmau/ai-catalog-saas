import { ErrorCode } from '../ErrorCode';
import { HttpError } from './HttpError';

export class ServiceUnavailable extends HttpError {
  public override statusCode = 503;
  public override code: ErrorCode;

  constructor(code?: ErrorCode, message?: string) {
    super();

    this.name = 'ServiceUnavailable';
    this.message = message ?? 'Service unavailable.';
    this.code = code ?? ErrorCode.SERVICE_UNAVAILABLE;
  }
}
