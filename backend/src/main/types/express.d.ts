import { AuthContext } from '@shared/types/AuthContext';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Request {
      auth?: AuthContext;
    }
  }
}

export { };

