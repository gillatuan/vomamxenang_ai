import type { Product } from "@/lib/api-client";
import { richTextPlain } from "@/lib/rich-text";

export function productFallbackImage(product: Pick<Product,"type"|"tireType"|"name">) {
  const text=`${product.type||""} ${product.tireType||""} ${product.name||""}`.toLowerCase();
  if(product.type==="RIM"||/mâm|mam|rim/.test(text)) return "/images/products/tire-rim-service.png";
  if(/non.?mark|white|trắng/.test(text)) return "/images/products/non-marking-clean-floor.png";
  if(/pneu|hơi|hoi/.test(text)) return "/images/products/pneumatic-outdoor.png";
  if(/used|cũ|luớt|lướt/.test(text)) return "/images/products/solid-workshop.png";
  return "/images/products/solid-warehouse.png";
}

export function productSeoDescription(product: Product) {
  // Do not invent SEO/marketing copy in the UI. Content must come from
  // reviewed product data (which can itself be curated from authoritative
  // manufacturer/product references before being saved).
  const candidates = [
    product.seo?.description,
    product.shortDescription,
    product.description,
  ];

  for (const candidate of candidates) {
    const text = richTextPlain(candidate || "").trim();
    if (text) return text;
  }

  return "";
}
