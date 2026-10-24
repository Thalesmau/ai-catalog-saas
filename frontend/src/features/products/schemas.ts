import { z } from 'zod';

import { parseBRL } from '@/lib/money';

export const productFormSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto.').max(120, 'Nome muito longo.'),
  description: z.string().trim().min(1, 'Informe a descrição.').max(2000, 'Máximo de 2000 caracteres.'),
  price: z
    .string()
    .trim()
    .min(1, 'Informe o preço.')
    .refine(value => (parseBRL(value) ?? 0) > 0, 'Preço inválido. Ex.: 129,90'),
  category: z.string().trim().min(2, 'Categoria muito curta.').max(60, 'Categoria muito longa.'),
  imageUrl: z.union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Informe uma URL http(s) válida.' })]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
