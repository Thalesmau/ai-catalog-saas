import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import '@main/config/bindings';
import { logger } from '@main/config/logger';
import { errorHandler, notFoundHandler } from '@main/middlewares/errorHandler';
import { routes } from '@main/routes';
import { env } from '@shared/config/env';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));
  app.use(pinoHttp({ logger }));

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
