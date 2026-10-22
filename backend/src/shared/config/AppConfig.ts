import { Injectable } from '@kernel/decorators/Injectable';
import { env } from './env';

@Injectable()
export class AppConfig {
  readonly app: AppConfig.App;
  readonly http: AppConfig.Http;
  readonly db: AppConfig.Database;

  constructor() {
    this.app = {
      env: env.NODE_ENV,
      logLevel: env.LOG_LEVEL,
    };

    this.http = {
      port: env.PORT,
      corsOrigin: env.CORS_ORIGIN,
    };

    this.db = {
      uri: env.MONGODB_URI,
      name: env.MONGODB_DB,
    };
  }
}

export namespace AppConfig {
  export type App = {
    env: 'development' | 'test' | 'production';
    logLevel: string;
  };

  export type Http = {
    port: number;
    corsOrigin: string;
  };

  export type Database = {
    uri: string;
    name: string;
  };
}
