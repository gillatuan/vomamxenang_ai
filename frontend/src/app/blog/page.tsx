import { hasFilters } from '@/lib/seo/keyword-utils';
import { siteUrl } from '@/lib/site-config';
import BlogPage from './BlogPage';
import { getPublicCollection } from '@/lib/public-seo';
import type { Post } from '@/lib/api-client';
export function generateMetadata({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return { alternates: { canonical: `${siteUrl}/blog` }, robots: { index: !hasFilters(searchParams), follow: true } };
}
export default async function Page() {
  const items = await getPublicCollection('posts');
  return <BlogPage initialPosts={items as Post[]} />;
}
