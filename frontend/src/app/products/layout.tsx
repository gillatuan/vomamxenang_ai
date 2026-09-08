import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sản phẩm lốp và mâm xe nâng",
  description: "Danh mục lốp đặc, lốp hơi, mâm và dịch vụ xe nâng. Xem kích thước, thương hiệu và tư vấn lựa chọn phù hợp.",
  alternates: { canonical: "/products" },
  openGraph: { title: "Sản phẩm lốp và mâm xe nâng", description: "Danh mục lốp đặc, lốp hơi, mâm và dịch vụ xe nâng. Xem kích thước, thương hiệu và tư vấn lựa chọn phù hợp.", url: "/products" },
};

export default function Layout({ children }: { children: ReactNode }) { return children; }
