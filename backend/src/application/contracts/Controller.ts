import { getSchema } from '@kernel/decorators/Schema';
import { AuthContext } from '@shared/types/AuthContext';

type TRouteType = 'public' | 'private';

export abstract class Controller<TType extends TRouteType, TBody = undefined> {
  abstract readonly routeType: TType;

  protected abstract handle(request: Controller.Request<TType>): Promise<Controller.Response<TBody>>;

  public execute(request: Controller.Request<TType>): Promise<Controller.Response<TBody>> {
    const body = this.validateBody(request.body);

    return this.handle({
      ...request,
      body,
    });
  }

  private validateBody(body: Controller.Request<TType>['body']) {
    const schema = getSchema(this);

    if (!schema) {
      return body;
    }

    return schema.parse(body) as Controller.Request<TType>['body'];
  }
}

export abstract class PublicController<TBody = undefined> extends Controller<'public', TBody> {
  readonly routeType = 'public' as const;
}

export abstract class PrivateController<TBody = undefined> extends Controller<'private', TBody> {
  readonly routeType = 'private' as const;
}

export namespace Controller {
  type BaseRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = {
    body: TBody;
    params: TParams;
    queryParams: TQueryParams;
  };

  type PublicRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    auth: null;
  };

  type PrivateRequest<
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = BaseRequest<TBody, TParams, TQueryParams> & {
    auth: AuthContext;
  };

  export type Request<
    TType extends TRouteType,
    TBody = Record<string, unknown>,
    TParams = Record<string, unknown>,
    TQueryParams = Record<string, unknown>,
  > = TType extends 'private'
    ? PrivateRequest<TBody, TParams, TQueryParams>
    : PublicRequest<TBody, TParams, TQueryParams>;

  export type Response<TBody = undefined> = {
    statusCode: number;
    body?: TBody;
  };
}
