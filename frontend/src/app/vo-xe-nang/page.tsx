import { TopicLandingPage } from '@/components/TopicLandingPage';
import { topicMetadata, topicProducts } from '@/lib/seo/category-seo';
import { hasFilters } from '@/lib/seo/keyword-utils';
import { getPublicCollection } from '@/lib/public-seo';
import type { Product } from '@/lib/api-client';
type Props = { searchParams: Record<string, string | string[] | undefined> };
export async function generateMetadata({ searchParams }: Props) {
  const products = topicProducts('vo-xe-nang', await getPublicCollection('products') as Product[]);
  return topicMetadata('vo-xe-nang', hasFilters(searchParams) || !products.length);
}
export default function Page() { return <TopicLandingPage slug="vo-xe-nang" />; }
