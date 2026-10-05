import type { Product } from "@/lib/api-client";

export function sizeToSlug(size: string) {
  return size.trim().toLowerCase().replace(/\./g, "-").replace(/\s+/g, "").replace(/[^a-z0-9x-]/g, "-").replace(/-+/g, "-");
}
export function productsForSize(products: Product[], slug: string) {
  return products.filter(p => p.status !== "DRAFT" && p.size && sizeToSlug(p.size) === slug);
}
export function uniqueProductSizes(products: Product[]) {
  const map = new Map<string,string>();
  products.forEach(p => { if (p.status !== "DRAFT" && p.size) map.set(sizeToSlug(p.size), p.size); });
  return [...map].map(([slug,size]) => ({ slug,size })).sort((a,b)=>a.size.localeCompare(b.size, "vi"));
}
