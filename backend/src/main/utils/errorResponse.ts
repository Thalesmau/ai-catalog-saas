import { Response } from 'express';

import { ErrorCode } from '@application/errors/ErrorCode';

interface IErrorResponseParams {
  statusCode: number;
  code: ErrorCode;
  message: any;
}

export function errorResponse(res: Response, { statusCode, code, message }: IErrorResponseParams) {
  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
