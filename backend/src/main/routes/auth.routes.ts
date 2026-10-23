import { Router } from 'express';

import { GetMeController } from '@application/controllers/auth/GetMeController';
import { SignInController } from '@application/controllers/auth/SignInController';
import { SignUpController } from '@application/controllers/auth/SignUpController';
import { expressHttpAdapter } from '@main/adapters/expressHttpAdapter';
import { authenticate } from '@main/middlewares/authenticate';
import { authRateLimit } from '@main/middlewares/rateLimit';

export const authRoutes = Router();

authRoutes.post('/auth/sign-up', authRateLimit, expressHttpAdapter(SignUpController));
authRoutes.post('/auth/sign-in', authRateLimit, expressHttpAdapter(SignInController));
authRoutes.get('/auth/me', authenticate, expressHttpAdapter(GetMeController));
