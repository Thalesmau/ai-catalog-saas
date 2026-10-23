import { z } from 'zod';

import { emailSchema, passwordSchema } from './credentialsSchemas';

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome muito curto.').max(80),
    email: emailSchema,
    password: passwordSchema,
    companyName: z.string().trim().min(2, 'Nome da empresa muito curto.').max(80).optional(),
    inviteCode: z.string().trim().toUpperCase().length(8, 'O código de convite tem 8 caracteres.').optional(),
  })
  .strict()
  .refine(data => Boolean(data.companyName) !== Boolean(data.inviteCode), {
    message: 'Informe companyName (criar empresa) ou inviteCode (entrar em uma existente), apenas um deles.',
    path: ['companyName'],
  });

export type SignUpBody = z.infer<typeof signUpSchema>;
