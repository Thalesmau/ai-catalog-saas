import { escapeRegex } from './escapeRegex';

const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
  'para', 'pra', 'por', 'com', 'que', 'ao', 'aos',
]);

const ACCENT_CLASSES: Record<string, string> = {
  a: '[aáàâãä]',
  e: '[eéèêë]',
  i: '[iíìîï]',
  o: '[oóòôõö]',
  u: '[uúùûü]',
  c: '[cç]',
  n: '[nñ]',
};

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function toSearchTerms(search: string): string[] {
  const terms = stripAccents(search.toLowerCase())
    .split(/[^\p{L}\p{N}-]+/u)
    .filter(term => term.length > 0 && !STOPWORDS.has(term));

  return [...new Set(terms)];
}

export function toAccentInsensitiveRegex(term: string): RegExp {
  const pattern = escapeRegex(term).replace(/[aeioucn]/g, char => ACCENT_CLASSES[char] ?? char);
  return new RegExp(pattern, 'i');
}
