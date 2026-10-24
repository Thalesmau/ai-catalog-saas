import 'reflect-metadata';

import { randomUUID } from 'node:crypto';

import { inject } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = inject('mongoUri');
process.env.MONGODB_DB = `test_${randomUUID().slice(0, 8)}`;
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.GEMINI_API_KEY = '';
