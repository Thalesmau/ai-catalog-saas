import { z } from 'zod';

import { emailSchema } from './credentialsSchemas';

export const signInSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Informe a senha.'),
  })
  .strict();

export type SignInBody = z.infer<typeof signInSchema>;
