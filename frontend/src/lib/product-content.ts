import type { Product } from "@/lib/api-client";
import { richTextPlain } from "@/lib/rich-text";

const typeLabel = (value?: string) => {
  const v=(value||"").toLowerCase();
  if(v.includes("non")||v.includes("white")) return "lốp đặc không để lại vệt";
  if(v.includes("pneu")||v.includes("hơi")) return "lốp hơi xe nâng";
  if(v.includes("solid")||v.includes("đặc")) return "lốp đặc xe nâng";
  return "vỏ xe nâng";
};

export function productFallbackImage(product: Pick<Product,"type"|"tireType"|"name">) {
  const text=`${product.type||""} ${product.tireType||""} ${product.name||""}`.toLowerCase();
  if(product.type==="RIM"||/mâm|mam|rim/.test(text)) return "/images/products/tire-rim-service.png";
  if(/non.?mark|white|trắng/.test(text)) return "/images/products/non-marking-clean-floor.png";
  if(/pneu|hơi|hoi/.test(text)) return "/images/products/pneumatic-outdoor.png";
  if(/used|cũ|luớt|lướt/.test(text)) return "/images/products/solid-workshop.png";
  return "/images/products/solid-warehouse.png";
}

export function productSeoDescription(product: Product) {
  const existing=richTextPlain(product.shortDescription||product.description||"").trim();
  if(existing.length>=110) return existing;
  const size=product.size ? ` kích thước ${product.size}` : "";
  const brand=product.brand ? ` ${product.brand}` : "";
  const kind=typeLabel(product.tireType);
  const condition=product.condition==="USED" ? "hàng đã qua sử dụng, cần kiểm tra tình trạng thực tế" : "hàng mới";
  return `${kind.charAt(0).toUpperCase()+kind.slice(1)}${brand}${size}, ${condition}. Phù hợp để đối chiếu cho xe nâng kho xưởng; cần xác nhận đúng kích thước, loại mâm, tải trọng và điều kiện vận hành trước khi lắp. Liên hệ Võ Mâm Xe Nâng để kiểm tra tồn kho, tư vấn cấu hình và báo giá hiện tại.`;
}
