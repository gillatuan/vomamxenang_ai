import { uniqueKeywords } from './seo/keyword-utils';
import { productSeoDefaults } from './seo/product-seo';
import { breadcrumbSchema, Crumb, jsonLd } from './seo/structured-data';
import type { PublicRim } from './seo/rim-seo';
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
  const defaults = item.name ? productSeoDefaults(item) : { title: item.title || 'Võ Mâm Xe Nâng', description: richTextPlain(item.excerpt || item.content || item.title || '').slice(0, 160) };
  const title = contentSeo.title?.trim() || defaults.title;
  const description = richTextPlain(contentSeo.description?.trim() || defaults.description || title).slice(0, 160);
  return { title, description, canonical: `${siteUrl}${fallbackPath}`, keywords: uniqueKeywords([...contentKeywords(item), ...(item.name && !contentSeo.primaryKeyword ? [productSeoDefaults(item).primaryKeyword, ...productSeoDefaults(item).secondaryKeywords] : [])]), robots: contentSeo.robots || 'index,follow', openGraph: contentSeo.openGraph, twitter: contentSeo.twitter };
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
  const entity = { '@context': 'https://schema.org', '@type': kind === 'products' ? 'Product' : 'BlogPosting', name: item.name || item.title, ...(kind === 'blog' ? { headline: item.title, datePublished: item.createdAt, mainEntityOfPage: { '@type': 'WebPage', '@id': seo.canonical } } : { sku: item.sku, ...(typeof item.sellingPrice === 'number' && item.sellingPrice > 0 ? { offers: { '@type': 'Offer', price: item.sellingPrice, priceCurrency: 'VND', url: seo.canonical } } : {}), ...(item.brand ? { brand: { '@type': 'Brand', name: item.brand } } : {}) }), description: seo.description, url: seo.canonical, ...((item.imageUrl || item.seo?.imageUrl) ? { image: item.imageUrl || item.seo?.imageUrl } : {}), keywords: seo.keywords.join(', ') };
  return jsonLd([entity, breadcrumbSchema(contentBreadcrumbs(item, kind))]);
}

export async function getPublicProducts(): Promise<Product[]> {
  return getPublicCollection('products') as Promise<Product[]>;
}

export async function getPublicCollection(type: 'products' | 'posts'): Promise<PublicSeoItem[]> {
  const response = await fetch(`${apiUrl}/${type}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tải danh mục. Vui lòng thử lại.');
  return response.json();
}

export function contentBreadcrumbs(item: PublicSeoItem, kind: 'products' | 'blog'): Crumb[] {
  const result: Crumb[] = [{ name: 'Trang chủ', path: '/' }];
  if (kind === 'products' && item.type === 'TIRE') {
    result.push({ name: 'Vỏ xe nâng', path: '/vo-xe-nang' });
    if (item.tireType === 'SOLID') result.push({ name: 'Vỏ đặc xe nâng', path: '/lop-dac-xe-nang' });
  } else result.push({ name: kind === 'products' ? 'Sản phẩm' : 'Bài viết', path: `/${kind}` });
  return [...result, { name: item.name || item.title || 'Chi tiết', path: contentPath(item, kind) }];
}
export async function getPublicRims(): Promise<PublicRim[]> {
  const response = await fetch(`${apiUrl}/wheel-rims`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không thể tải danh mục mâm.');
  return response.json();
}
