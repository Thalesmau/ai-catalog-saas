import { Router } from 'express';

import { GetHealthController } from '@application/controllers/health/GetHealthController';
import { expressHttpAdapter } from '@main/adapters/expressHttpAdapter';

export const healthRoutes = Router();

healthRoutes.get('/health', expressHttpAdapter(GetHealthController));
