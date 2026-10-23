import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { healthRoutes } from './health.routes';
import { productsRoutes } from './products.routes';

export const routes = Router();

routes.use(healthRoutes);
routes.use(authRoutes);
routes.use(productsRoutes);
