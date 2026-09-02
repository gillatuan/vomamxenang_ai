import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/public-seo";

const apiUrl = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || "https://vomamxenang-backend.vercel.app/api/v1").replace(/\/$/, "");

async function load(path: string): Promise<Array<{ id: string; createdAt?: string }>> {
  try {
    const response = await fetch(`${apiUrl}/${path}`, { next: { revalidate: 3600 } });
    return response.ok ? response.json() : [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([load("products"), load("posts")]);
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    ...products.map((item) => ({ url: `${siteUrl}/products/${item.id}`, lastModified: item.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((item) => ({ url: `${siteUrl}/blog/${item.id}`, lastModified: item.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
