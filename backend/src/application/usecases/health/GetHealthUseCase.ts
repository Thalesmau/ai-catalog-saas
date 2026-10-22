import { MongoDbClient } from '@infra/clients/MongoDbClient';
import { Injectable } from '@kernel/decorators/Injectable';

@Injectable()
export class GetHealthUseCase {
  constructor(private readonly mongoDbClient: MongoDbClient) {}

  async execute(): Promise<GetHealthUseCase.Output> {
    const database = await this.mongoDbClient.ping();

    return {
      status: database ? 'ok' : 'degraded',
      uptime: Math.round(process.uptime()),
      checks: {
        database: database ? 'up' : 'down',
      },
    };
  }
}

export namespace GetHealthUseCase {
  export type Output = {
    status: 'ok' | 'degraded';
    uptime: number;
    checks: {
      database: 'up' | 'down';
    };
  };
}
