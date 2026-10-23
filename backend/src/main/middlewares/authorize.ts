import { RequestHandler } from 'express';

import { ErrorCode } from '@application/errors/ErrorCode';
import { Forbidden } from '@application/errors/http/Forbidden';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { TRole } from '@shared/types/AuthContext';

export function authorize(...roles: TRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      throw new Unauthorized();
    }

    if (!roles.includes(req.auth.role)) {
      throw new Forbidden(ErrorCode.FORBIDDEN, 'Você não tem permissão para esta ação.');
    }

    next();
  };
}
