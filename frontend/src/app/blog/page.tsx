import BlogPage from './BlogPage';
import { getPublicCollection } from '@/lib/public-seo';
import type { Post } from '@/lib/api-client';
export default async function Page() {
  const items = await getPublicCollection('posts');
  return <BlogPage initialPosts={items as Post[]} />;
}
