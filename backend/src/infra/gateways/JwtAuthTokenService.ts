import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { AuthTokenService } from '@application/gateways/AuthTokenService';
import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import { AuthContext, ROLES } from '@shared/types/AuthContext';

const ALGORITHM = 'HS256';

const payloadSchema = z.object({
  sub: z.string().min(1),
  cid: z.string().min(1),
  role: z.enum(ROLES),
});

@Injectable()
export class JwtAuthTokenService extends AuthTokenService {
  constructor(private readonly config: AppConfig) {
    super();
  }

  sign({ accountId, companyId, role }: AuthContext): string {
    return jwt.sign(
      { cid: companyId, role },
      this.config.auth.jwtSecret,
      {
        subject: accountId,
        algorithm: ALGORITHM,
        expiresIn: this.config.auth.jwtExpiresIn,
      },
    );
  }

  verify(token: string): AuthContext | null {
    try {
      const decoded = jwt.verify(token, this.config.auth.jwtSecret, { algorithms: [ALGORITHM] });
      const payload = payloadSchema.safeParse(decoded);

      if (!payload.success) {
        return null;
      }

      return {
        accountId: payload.data.sub,
        companyId: payload.data.cid,
        role: payload.data.role,
      };
    } catch {
      return null;
    }
  }
}
