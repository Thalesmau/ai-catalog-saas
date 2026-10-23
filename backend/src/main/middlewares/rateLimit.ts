import { rateLimit } from 'express-rate-limit';

import { ErrorCode } from '@application/errors/ErrorCode';
import { errorResponse } from '@main/utils/errorResponse';
import { env } from '@shared/config/env';

export const authRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => errorResponse(res, {
    statusCode: 429,
    code: ErrorCode.RATE_LIMITED,
    message: 'Muitas tentativas. Tente novamente em instantes.',
  }),
});
