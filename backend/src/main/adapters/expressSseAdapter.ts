import { RequestHandler } from 'express';

import { StreamController } from '@application/contracts/StreamController';
import { ApplicationError } from '@application/errors/application/ApplicationError';
import { ErrorCode } from '@application/errors/ErrorCode';
import { HttpError } from '@application/errors/http/HttpError';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { Registry } from '@kernel/di/Registry';
import { Constructor } from '@shared/types/Constructor';

const HEARTBEAT_INTERVAL_MS = 15_000;

type TStreamEvent = { type: string; [key: string]: unknown };

export function expressSseAdapter(controllerImpl: Constructor<StreamController<TStreamEvent, any>>): RequestHandler {
  const controller = Registry.getInstance().resolve(controllerImpl);

  return async (req, res) => {
    if (!req.auth) {
      throw new Unauthorized();
    }

    const request = controller.validate({
      body: req.body ?? {},
      params: req.params,
      queryParams: req.query as Record<string, unknown>,
      auth: req.auth,
    });

    const abortController = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) {
        abortController.abort();
      }
    });

    if (req.query.stream === 'false') {
      const events: TStreamEvent[] = [];
      await controller.run(request, event => events.push(event), abortController.signal);

      res.status(200).json(aggregate(events));
      return;
    }

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const send = (event: TStreamEvent) => {
      if (!res.writableEnded) {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      }
    };

    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_INTERVAL_MS);

    try {
      await controller.run(request, send, abortController.signal);
    } catch (error) {
      if (!abortController.signal.aborted) {
        req.log.error({ err: error }, 'Stream failed');
        send({ type: 'error', ...toStreamError(error) });
      }
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  };
}

function aggregate(events: TStreamEvent[]) {
  const answer = events
    .filter(event => event.type === 'text')
    .map(event => event.delta)
    .join('');

  const toolCalls = events
    .filter(event => event.type === 'tool_call')
    .map(call => ({
      name: call.name,
      input: call.input,
      output: events.find(event => event.type === 'tool_result' && event.id === call.id)?.output,
    }));

  return { answer, toolCalls };
}

function toStreamError(error: unknown): { code: string; message: string } {
  if (error instanceof HttpError || error instanceof ApplicationError) {
    return { code: error.code, message: error.message };
  }

  return { code: ErrorCode.INTERNAL_SERVER_ERROR, message: 'Erro ao gerar a resposta.' };
}
