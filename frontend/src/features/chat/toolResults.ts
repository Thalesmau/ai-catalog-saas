import { formatBRL } from '@/lib/money';

import type { ChatProduct, ToolCall } from './types';

const TOOL_LABELS: Record<string, string> = {
  search_products: 'Buscando produtos',
  get_product_details: 'Consultando detalhes do produto',
  list_categories: 'Listando categorias',
};

const SORT_LABELS: Record<string, string> = {
  price_asc: 'menor preço',
  price_desc: 'maior preço',
  name: 'ordem alfabética',
  newest: 'mais recentes',
};

const reais = (value: number) => formatBRL(Math.round(value * 100));

export function describeToolCall({ name, input }: Pick<ToolCall, 'name' | 'input'>): string {
  const label = TOOL_LABELS[name] ?? `Usando ${name}`;

  if (name !== 'search_products') {
    return label;
  }

  const details: string[] = [];

  if (typeof input.query === 'string' && input.query) {
    details.push(`"${input.query}"`);
  }

  if (typeof input.category === 'string' && input.category) {
    details.push(`categoria ${input.category}`);
  }

  if (typeof input.minPrice === 'number') {
    details.push(`a partir de ${reais(input.minPrice)}`);
  }

  if (typeof input.maxPrice === 'number') {
    details.push(`até ${reais(input.maxPrice)}`);
  }

  if (typeof input.sortBy === 'string' && SORT_LABELS[input.sortBy]) {
    details.push(SORT_LABELS[input.sortBy]!);
  }

  return details.length > 0 ? `${label}: ${details.join(', ')}` : label;
}

function unwrap(output: unknown): Record<string, unknown> | null {
  if (!output || typeof output !== 'object') {
    return null;
  }

  const value = output as Record<string, unknown>;
  const inner = 'output' in value ? value.output : value;

  return inner && typeof inner === 'object' ? inner as Record<string, unknown> : null;
}

function isProduct(value: unknown): value is ChatProduct {
  const product = value as ChatProduct | null;
  return Boolean(product && typeof product.id === 'string' && typeof product.name === 'string');
}

export function summarizeToolResult(call: ToolCall): string | null {
  const output = unwrap(call.output);

  if (call.status === 'error' || !output || 'error' in output) {
    return 'sem resultado';
  }

  if (typeof output.total === 'number') {
    return output.total === 1 ? '1 produto' : `${output.total} produtos`;
  }

  if (Array.isArray(output.categories)) {
    return `${output.categories.length} categorias`;
  }

  return null;
}

export function extractProducts(toolCalls: ToolCall[]): ChatProduct[] {
  const products = new Map<string, ChatProduct>();

  for (const call of toolCalls) {
    const output = unwrap(call.output);

    if (call.status !== 'done' || !output) {
      continue;
    }

    const found = Array.isArray(output.products) ? output.products : [output.product];

    for (const product of found) {
      if (isProduct(product)) {
        products.set(product.id, product);
      }
    }
  }

  return [...products.values()];
}
