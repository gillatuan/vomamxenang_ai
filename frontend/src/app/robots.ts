import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/public-seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/auth/", "/checkout/"] }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
