import type { Product } from '../api-client';
import { richTextPlain } from '../rich-text';

// SEO fallbacks only reuse editor-maintained Product fields. Never manufacture
// generic purchase claims or search copy from a hardcoded marketing template.
export function productSeoDefaults(product: Partial<Product>) {
  const name = product.name?.trim() || '';
  const description = richTextPlain(product.shortDescription || product.description || '').replace(/\s+/g, ' ').trim();
  return {
    title: name,
    description: description.slice(0, 160),
    primaryKeyword: '',
    secondaryKeywords: [] as string[],
    imageAlt: product.seo?.imageAlt?.trim() || name,
  };
}
