import 'reflect-metadata';

import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { Registry } from '@kernel/di/Registry';
import { createApp } from '@main/app';
import { logger } from '@main/config/logger';
import { env } from '@shared/config/env';

async function bootstrap() {
  const mongoDbClient = Registry.getInstance().resolve(MongoDbClient);
  await mongoDbClient.connect();
  logger.info('MongoDB connected');

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info(`${signal} received, shutting down`);

    server.close(async () => {
      await mongoDbClient.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start API');
  process.exit(1);
});
