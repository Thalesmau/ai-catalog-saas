import { RequestHandler } from 'express';

import { ErrorCode } from '@application/errors/ErrorCode';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { Registry } from '@kernel/di/Registry';

let authTokenService: AuthTokenService | undefined;

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    throw new Unauthorized(ErrorCode.UNAUTHORIZED, 'Token não fornecido.');
  }

  authTokenService ??= Registry.getInstance().resolve(AuthTokenService);
  const auth = authTokenService.verify(token);

  if (!auth) {
    throw new Unauthorized(ErrorCode.UNAUTHORIZED, 'Token inválido ou expirado.');
  }

  req.auth = auth;
  next();
};
