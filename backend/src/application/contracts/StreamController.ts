import { getSchema } from '@kernel/decorators/Schema';

import { Controller } from './Controller';

export abstract class StreamController<TEvent, TBody = Record<string, unknown>> {
  readonly routeType = 'private' as const;

  protected abstract stream(
    request: Controller.Request<'private', TBody>,
    emit: (event: TEvent) => void,
    signal: AbortSignal,
  ): Promise<void>;

  public validate(request: Controller.Request<'private'>): Controller.Request<'private', TBody> {
    const schema = getSchema(this);

    return {
      ...request,
      body: (schema ? schema.parse(request.body) : request.body) as TBody,
    };
  }

  public run(
    request: Controller.Request<'private', TBody>,
    emit: (event: TEvent) => void,
    signal: AbortSignal,
  ): Promise<void> {
    return this.stream(request, emit, signal);
  }
}
