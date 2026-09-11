import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/checkout", "/api/", "/account", "/cart", "/login"] }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
