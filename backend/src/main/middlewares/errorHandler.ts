import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/http/HttpError';
import { errorResponse } from '@main/utils/errorResponse';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    return errorResponse(res, {
      statusCode: 400,
      code: ErrorCode.VALIDATION,
      message: error.issues.map(issue => ({
        field: issue.path.map(String).join('.'),
        error: issue.message,
      })),
    });
  }

  if (error instanceof HttpError) {
    return errorResponse(res, error);
  }

  if (error instanceof ApplicationError) {
    return errorResponse(res, {
      statusCode: error.statusCode ?? 400,
      code: error.code,
      message: error.message,
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return errorResponse(res, { statusCode: 400, code: ErrorCode.BAD_REQUEST, message: 'Malformed body.' });
  }

  if (error?.type === 'entity.too.large') {
    return errorResponse(res, { statusCode: 413, code: ErrorCode.BAD_REQUEST, message: 'Payload too large.' });
  }

  req.log.error({ err: error }, 'Unhandled error');

  return errorResponse(res, {
    statusCode: 500,
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error.',
  });
};

export const notFoundHandler: RequestHandler = (req, res) => {
  errorResponse(res, {
    statusCode: 404,
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found.`,
  });
};
