import { z } from 'zod';

import { Product } from '@application/entities/Product';
import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { formatBRL, reaisToCents } from '@shared/utils/money';
import { toSearchTerms } from '@shared/utils/searchTerms';

import { defineTool, IAgentTool } from '../AgentTool';

const MAX_DESCRIPTION_LENGTH = 280;

const searchProductsInput = z.object({
  query: z.string().max(100).optional()
    .describe('Termo livre buscado no nome, descrição e categoria. Ex.: "fone", "sem glúten".'),
  category: z.string().max(60).optional()
    .describe('Nome exato de uma categoria (use list_categories para descobrir as disponíveis).'),
  minPrice: z.number().min(0).optional().describe('Preço mínimo em reais (BRL).'),
  maxPrice: z.number().min(0).optional().describe('Preço máximo em reais (BRL).'),
  sortBy: z.enum(['price_asc', 'price_desc', 'name', 'newest']).optional()
    .describe('Ordenação. Use price_asc para "mais barato" e price_desc para "mais caro".'),
  limit: z.number().int().min(1).max(10).optional().describe('Quantidade máxima de produtos (padrão 5).'),
});

const getProductDetailsInput = z.object({
  productId: z.string().describe('Id do produto retornado por search_products.'),
});

const listCategoriesInput = z.object({});

function toToolProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: formatBRL(product.priceInCents),
    priceInCents: product.priceInCents,
    description: product.description.length > MAX_DESCRIPTION_LENGTH
      ? `${product.description.slice(0, MAX_DESCRIPTION_LENGTH)}…`
      : product.description,
    imageUrl: product.imageUrl,
  };
}

export type ToolProduct = ReturnType<typeof toToolProduct>;

export function createProductTools({ companyId, productRepository }: ProductToolsDeps): IAgentTool[] {
  return [
    defineTool({
      name: 'search_products',
      description:
        'Busca produtos no catálogo da empresa do usuário. Use para qualquer pergunta sobre produtos, ' +
        'disponibilidade, preços, comparações ou recomendações. Retorna o total encontrado e os produtos.',
      inputSchema: searchProductsInput,
      run: async (input) => {
        const filters: ProductRepository.ListFilters = {
          search: input.query,
          category: input.category,
          minPriceInCents: input.minPrice !== undefined ? reaisToCents(input.minPrice) : undefined,
          maxPriceInCents: input.maxPrice !== undefined ? reaisToCents(input.maxPrice) : undefined,
          sortBy: input.sortBy,
          page: 1,
          pageSize: input.limit ?? 5,
        };

        const strict = await productRepository.list(companyId, filters);

        if (strict.total > 0 || toSearchTerms(input.query ?? '').length < 2) {
          return { total: strict.total, products: strict.items.map(toToolProduct) };
        }

        const broad = await productRepository.list(companyId, { ...filters, searchMode: 'any' });

        return {
          total: broad.total,
          products: broad.items.map(toToolProduct),
          note: broad.total > 0
            ? 'Nenhum produto contém todos os termos; estes contêm ao menos um deles. Confira se atendem ao pedido.'
            : undefined,
        };
      },
    }),
    defineTool({
      name: 'get_product_details',
      description: 'Retorna todos os detalhes de um produto específico pelo id.',
      inputSchema: getProductDetailsInput,
      run: async ({ productId }) => {
        const product = await productRepository.findById(companyId, productId);

        return product
          ? { product: { ...toToolProduct(product), description: product.description } }
          : { error: 'Produto não encontrado.' };
      },
    }),
    defineTool({
      name: 'list_categories',
      description:
        'Lista as categorias do catálogo com quantidade de produtos e faixa de preço. ' +
        'Use para visão geral do catálogo ou para descobrir o nome exato de uma categoria.',
      inputSchema: listCategoriesInput,
      run: async () => {
        const categories = await productRepository.listCategories(companyId);

        return {
          categories: categories.map(category => ({
            category: category.category,
            productCount: category.productCount,
            priceRange: `${formatBRL(category.minPriceInCents)} a ${formatBRL(category.maxPriceInCents)}`,
          })),
        };
      },
    }),
  ];
}

type ProductToolsDeps = {
  companyId: string;
  productRepository: ProductRepository;
};
