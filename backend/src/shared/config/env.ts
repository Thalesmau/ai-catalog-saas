import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).default('ai_catalog'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter ao menos 32 caracteres.'),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'Use o formato 15m, 12h, 1d...').default('1d'),
  GEMINI_API_KEY: z.string().trim().optional().transform(value => value || undefined),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.8-flash'),
  GEMINI_FALLBACK_MODEL: z.string().trim().default('gemini-3.1-flash-lite').transform(value => value || undefined),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().min(10_000, 'O Gemini exige timeout de no mínimo 10000ms.').default(15_000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Variáveis de ambiente inválidas:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
