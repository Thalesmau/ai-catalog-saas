import { z } from 'zod';

export const chatSchema = z
  .object({
    message: z.string().trim().min(1, 'Digite uma mensagem.').max(2000),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().max(4000),
        }).strict(),
      )
      .max(20)
      .default([]),
  })
  .strict();

export type ChatBody = z.infer<typeof chatSchema>;
