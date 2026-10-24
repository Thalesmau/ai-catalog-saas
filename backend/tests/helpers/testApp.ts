import { Express } from 'express';

import { LlmGateway } from '@application/gateways/LlmGateway';
import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { ensureIndexes } from '@infra/database/indexes';
import { Registry } from '@kernel/di/Registry';

import { FakeLlmGateway } from '../fakes/FakeLlmGateway';

export async function connectTestDatabase(): Promise<MongoDbClient> {
  const mongoDbClient = Registry.getInstance().resolve(MongoDbClient);
  await mongoDbClient.connect();
  await ensureIndexes(mongoDbClient.db());

  return mongoDbClient;
}

export async function disconnectTestDatabase(mongoDbClient: MongoDbClient): Promise<void> {
  await mongoDbClient.db().dropDatabase();
  await mongoDbClient.disconnect();
}

export async function createTestApp(): Promise<Express> {
  await import('@main/config/bindings');
  Registry.getInstance().bind(LlmGateway, FakeLlmGateway);

  const { createApp } = await import('@main/app');

  return createApp();
}
