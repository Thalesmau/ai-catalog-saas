import { z } from 'zod';

const MAX_PRICE_IN_CENTS = 100_000_000;

const productFields = {
  name: z.string().trim().min(2, 'Nome muito curto.').max(120),
  description: z.string().trim().min(1, 'Informe a descrição.').max(2000),
  priceInCents: z
    .number({ error: 'Informe o preço em centavos.' })
    .int('O preço deve ser um inteiro em centavos.')
    .positive('O preço deve ser maior que zero.')
    .max(MAX_PRICE_IN_CENTS),
  category: z.string().trim().min(2, 'Categoria muito curta.').max(60),
  imageUrl: z
    .url({ protocol: /^https?$/, error: 'Informe uma URL http(s) válida.' })
    .max(2048)
    .nullable(),
};

export const createProductSchema = z
  .object({
    ...productFields,
    imageUrl: productFields.imageUrl.optional().default(null),
  })
  .strict();

export const updateProductSchema = z
  .object(productFields)
  .partial()
  .strict()
  .refine(data => Object.keys(data).length > 0, { message: 'Informe ao menos um campo para atualizar.' });

export const listProductsQuerySchema = z.object({
  search: z.string().trim().max(100).optional().transform(value => value || undefined),
  category: z.string().trim().max(60).optional().transform(value => value || undefined),
  minPriceInCents: z.coerce.number().int().min(0).optional(),
  maxPriceInCents: z.coerce.number().int().min(0).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'name']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
