import { topicProducts } from '@/lib/seo/category-seo';
import type { Product } from '@/lib/api-client';
import { getPublicRims } from '@/lib/public-seo';
import { rimPath } from '@/lib/seo/rim-seo';
import { uniqueProductSizes } from '@/lib/seo/size-seo';
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

const apiUrl = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || "https://vomamxenang-backend.vercel.app/api/v1").replace(/\/$/, "");

async function load(path: string): Promise<Array<{ id: string; slug?: string; createdAt?: string; seo?: { robots?: string } }>> {
  const response = await fetch(`${apiUrl}/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sitemap source unavailable: ${path}`);
  return response.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, rims] = await Promise.all([load("products"), load("posts"), getPublicRims()]);
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services/ep-vo-xe-nang`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/services/thay-vo-xe-nang`, changeFrequency: "monthly", priority: 0.9 },
    ...(['vo-xe-nang', 'lop-dac-xe-nang', 'mam-xe-nang'] as const).filter(slug => topicProducts(slug, products as Product[]).length || slug === 'mam-xe-nang' && rims.length).map(slug => ({ url: `${siteUrl}/${slug}`, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...rims.map(rim => ({ url: siteUrl + rimPath(rim), lastModified: rim.createdAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...uniqueProductSizes(products as Product[]).map(({ slug }) => ({ url: `${siteUrl}/kich-thuoc/${slug}`, changeFrequency: 'daily' as const, priority: 0.85 })),
    ...products.filter(item => !item.seo?.robots?.includes("noindex")).map((item) => ({ url: `${siteUrl}/products/${encodeURIComponent(item.slug || item.id)}`, lastModified: item.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.filter(item => !item.seo?.robots?.includes("noindex")).map((item) => ({ url: `${siteUrl}/blog/${encodeURIComponent(item.slug || item.id)}`, lastModified: item.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
