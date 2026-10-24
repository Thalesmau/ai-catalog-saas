import { Router } from 'express';

import { ChatController } from '@application/controllers/chat/ChatController';
import { expressSseAdapter } from '@main/adapters/expressSseAdapter';
import { authenticate } from '@main/middlewares/authenticate';
import { chatRateLimit } from '@main/middlewares/rateLimit';

export const chatRoutes = Router();

chatRoutes.post('/chat', authenticate, chatRateLimit, expressSseAdapter(ChatController));
