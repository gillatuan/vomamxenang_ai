import type { SeoMetadata } from "@/lib/api-client";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://vomamxenang.com").replace(/\/$/, "");
const apiUrl = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || "https://vomamxenang-backend.vercel.app/api/v1").replace(/\/$/, "");

export type PublicSeoItem = {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  seo?: SeoMetadata | null;
  tags?: string[];
  createdAt?: string;
};

export async function getPublicSeoItem(type: "products" | "posts", id: string): Promise<PublicSeoItem | null> {
  try {
    const response = await fetch(`${apiUrl}/${type}/${encodeURIComponent(id)}`, { next: { revalidate: 3600 } });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

export function seoValues(item: PublicSeoItem, fallbackPath: string) {
  const contentSeo = item.seo ?? {};
  const title = contentSeo.title || item.name || item.title || "Võ Mâm Xe Nâng";
  const description = contentSeo.description || item.description || "Võ Mâm Xe Nâng chuyên cung cấp lốp, mâm và phụ tùng xe nâng.";
  const canonicalPath = contentSeo.canonicalPath?.startsWith("/") ? contentSeo.canonicalPath : fallbackPath;
  return { title, description, canonical: `${siteUrl}${canonicalPath}`, keywords: contentSeo.keywords || item.tags || [], robots: contentSeo.robots || "index,follow", openGraph: contentSeo.openGraph, twitter: contentSeo.twitter };
}
