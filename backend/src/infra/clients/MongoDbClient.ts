import { Collection, Db, Document, MongoClient } from 'mongodb';

import { Injectable } from '@kernel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';

@Injectable()
export class MongoDbClient {
  private static client: MongoClient | undefined;

  constructor(private readonly config: AppConfig) {}

  async connect(): Promise<void> {
    if (MongoDbClient.client) {
      return;
    }

    const client = new MongoClient(this.config.db.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5_000,
    });

    await client.connect();
    MongoDbClient.client = client;
  }

  async disconnect(): Promise<void> {
    await MongoDbClient.client?.close();
    MongoDbClient.client = undefined;
  }

  db(): Db {
    if (!MongoDbClient.client) {
      throw new Error('MongoDbClient is not connected. Call connect() first.');
    }

    return MongoDbClient.client.db(this.config.db.name);
  }

  collection<T extends Document>(name: string): Collection<T> {
    return this.db().collection<T>(name);
  }

  async ping(): Promise<boolean> {
    try {
      await this.db().command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
