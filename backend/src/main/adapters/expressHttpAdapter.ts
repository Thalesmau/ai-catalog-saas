import { RequestHandler } from 'express';

import { Controller } from '@application/contracts/Controller';
import { Unauthorized } from '@application/errors/http/Unauthorized';
import { Registry } from '@kernel/di/Registry';
import { Constructor } from '@shared/types/Constructor';

export function expressHttpAdapter(controllerImpl: Constructor<Controller<any, unknown>>): RequestHandler {
  const controller = Registry.getInstance().resolve(controllerImpl);

  return async (req, res) => {
    if (controller.routeType === 'private' && !req.auth) {
      throw new Unauthorized();
    }

    const response = await controller.execute({
      body: req.body ?? {},
      params: req.params,
      queryParams: req.query as Record<string, unknown>,
      auth: req.auth ?? null,
    });

    if (response.body === undefined) {
      res.status(response.statusCode).end();
      return;
    }

    res.status(response.statusCode).json(response.body);
  };
}
