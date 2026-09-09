import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

const apiUrl = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || "https://vomamxenang-backend.vercel.app/api/v1").replace(/\/$/, "");

async function load(path: string): Promise<Array<{ id: string; slug?: string; createdAt?: string; seo?: { robots?: string } }>> {
  const response = await fetch(`${apiUrl}/${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sitemap source unavailable: ${path}`);
  return response.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([load("products"), load("posts")]);
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    ...products.filter(item => !item.seo?.robots?.includes("noindex")).map((item) => ({ url: `${siteUrl}/products/${encodeURIComponent(item.slug || item.id)}`, lastModified: item.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.filter(item => !item.seo?.robots?.includes("noindex")).map((item) => ({ url: `${siteUrl}/blog/${encodeURIComponent(item.slug || item.id)}`, lastModified: item.createdAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
