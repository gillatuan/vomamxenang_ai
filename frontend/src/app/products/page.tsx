import { hasFilters } from '@/lib/seo/keyword-utils';
import { siteUrl } from '@/lib/site-config';
import ProductsPage from './ProductsPage';
import { getPublicCollection } from '@/lib/public-seo';
import type { Product } from '@/lib/api-client';
export function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return { alternates: { canonical: `${siteUrl}/products` }, robots: { index: !hasFilters(searchParams), follow: true } };
}
export default async function Page() {
  const items = await getPublicCollection('products');
  return <ProductsPage initialProducts={items as Product[]} />;
}
