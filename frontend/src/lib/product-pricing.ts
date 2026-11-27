import type { Product } from "./api-client";

export function hasQuoteRange(product: Pick<Product, "priceMin" | "priceMax">): boolean {
  return typeof product.priceMin === "number" && typeof product.priceMax === "number" &&
    product.priceMin > 0 && product.priceMax >= product.priceMin;
}

export function productPriceText(product: Pick<Product, "priceMin" | "priceMax" | "sellingPrice">): string {
  if (hasQuoteRange(product)) {
    return product.priceMin === product.priceMax
      ? `Giá tham khảo: ${product.priceMin!.toLocaleString("vi-VN")} ₫`
      : `${product.priceMin!.toLocaleString("vi-VN")} – ${product.priceMax!.toLocaleString("vi-VN")} ₫`;
  }
  return typeof product.sellingPrice === "number" && product.sellingPrice > 0
    ? `${product.sellingPrice.toLocaleString("vi-VN")} ₫`
    : "Liên hệ báo giá";
}

export function canCheckoutProduct(product: Pick<Product, "priceMin" | "priceMax" | "sellingPrice" | "tags">): boolean {
  return !hasQuoteRange(product) && !product.tags?.includes("PRICE_REFERENCE_2026") &&
    typeof product.sellingPrice === "number" && product.sellingPrice > 0;
}
