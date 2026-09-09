import type { Metadata } from 'next';
import type { Product, Post } from '@/lib/api-client';
import { contentKeywords, contentPath, RelatedContent } from './content-seo';
import { richTextPlain } from './rich-text';

import { siteUrl } from './site-config';
export { siteUrl } from './site-config';
const apiUrl = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://vomamxenang-backend.vercel.app/api/v1').replace(/\/$/, '');
export type PublicSeoItem = Partial<Product & Post> & { id: string; createdAt?: string; excerpt?: string; aliases?: string[] };

export async function getPublicSeoItem(type: 'products' | 'posts', alias: string): Promise<PublicSeoItem | null> {
  const response = await fetch(`${apiUrl}/${type}/${encodeURIComponent(alias)}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Không thể tải nội dung.');
  return response.json();
}
export async function getRelatedCatalog(): Promise<RelatedContent[]> {
  const results = await Promise.all(['products', 'posts'].map(async type => {
    try {
      const response = await fetch(`${apiUrl}/${type}`, { cache: 'no-store' });
      if (!response.ok) return [];
      const items: PublicSeoItem[] = await response.json();
      return items.filter(item => !item.seo?.robots?.includes('noindex')).map(item => ({ id: item.id, slug: item.slug, aliases: item.aliases, name: item.name, size: item.size, brand: item.brand, tireType: item.tireType, title: item.title, tags: item.tags, seo: item.seo, kind: type === 'products' ? 'products' as const : 'blog' as const }));
    } catch { return []; }
  }));
  return results.flat();
}
export function seoValues(item: PublicSeoItem, fallbackPath: string) {
  const contentSeo = item.seo ?? {};
  const title = contentSeo.title || item.name || item.title || 'Võ Mâm Xe Nâng';
  const description = richTextPlain(contentSeo.description || item.shortDescription || item.excerpt || item.description || item.content || title).slice(0, 160);
  return { title, description, canonical: `${siteUrl}${fallbackPath}`, keywords: contentKeywords(item), robots: contentSeo.robots || 'index,follow', openGraph: contentSeo.openGraph, twitter: contentSeo.twitter };
}
export function contentMetadata(item: PublicSeoItem, kind: 'products' | 'blog'): Metadata {
  const seo = seoValues(item, contentPath(item, kind));
  return {
    title: { absolute: seo.title }, description: seo.description, keywords: seo.keywords,
    alternates: { canonical: seo.canonical }, robots: seo.robots,
    openGraph: { type: kind === 'blog' ? 'article' : 'website', title: seo.openGraph?.title || seo.title, description: seo.openGraph?.description || seo.description, url: seo.canonical, ...((item.imageUrl || item.seo?.imageUrl) ? { images: [{ url: (item.imageUrl || item.seo?.imageUrl)!, alt: item.seo?.imageAlt || item.name || item.title }] } : {}) },
    twitter: { card: 'summary_large_image', title: seo.twitter?.title || seo.title, description: seo.twitter?.description || seo.description },
  };
}
export function contentJsonLd(item: PublicSeoItem, kind: 'products' | 'blog') {
  const seo = seoValues(item, contentPath(item, kind));
  const entity = { '@context': 'https://schema.org', '@type': kind === 'products' ? 'Product' : 'BlogPosting', name: item.name || item.title, ...(kind === 'blog' ? { headline: item.title, datePublished: item.createdAt } : { sku: item.sku, ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}) }), description: seo.description, url: seo.canonical, ...((item.imageUrl || item.seo?.imageUrl) ? { image: item.imageUrl || item.seo?.imageUrl } : {}), keywords: seo.keywords.join(', ') };
  return JSON.stringify([entity, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: kind === 'products' ? 'Sản phẩm' : 'Bài viết', item: `${siteUrl}/${kind}` },
    { '@type': 'ListItem', position: 3, name: item.name || item.title, item: seo.canonical },
  ] }]).replace(/</g, '\\u003c');
}

export async function getPublicCollection(type: 'products' | 'posts'): Promise<PublicSeoItem[]> {
  const response = await fetch(`${apiUrl}/${type}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tải danh mục. Vui lòng thử lại.');
  return response.json();
}
