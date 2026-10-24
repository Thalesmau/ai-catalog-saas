import { z } from 'zod';

const email = z.string().trim().min(1, 'Informe o email.').pipe(z.email('Email inválido.'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha.'),
});

const accountFields = {
  name: z.string().trim().min(2, 'Nome muito curto.').max(80, 'Nome muito longo.'),
  email,
  password: z
    .string()
    .min(8, 'A senha precisa ter ao menos 8 caracteres.')
    .max(72, 'A senha pode ter no máximo 72 caracteres.'),
};

export const createCompanySchema = z.object({
  ...accountFields,
  companyName: z.string().trim().min(2, 'Nome da empresa muito curto.').max(80, 'Nome muito longo.'),
});

export const joinCompanySchema = z.object({
  ...accountFields,
  inviteCode: z.string().trim().toUpperCase().length(8, 'O código de convite tem 8 caracteres.'),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type CreateCompanyValues = z.infer<typeof createCompanySchema>;
export type JoinCompanyValues = z.infer<typeof joinCompanySchema>;
