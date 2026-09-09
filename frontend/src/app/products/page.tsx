import ProductsPage from './ProductsPage';
import { getPublicCollection } from '@/lib/public-seo';
import type { Product } from '@/lib/api-client';
export default async function Page() {
  const items = await getPublicCollection('products');
  return <ProductsPage initialProducts={items as Product[]} />;
}
