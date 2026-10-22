import { AuthContext } from '@shared/types/AuthContext';

export abstract class AuthTokenService {
  abstract sign(context: AuthContext): string;

  abstract verify(token: string): AuthContext | null;
}
