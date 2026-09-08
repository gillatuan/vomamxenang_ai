import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Giới thiệu Võ Mâm Xe Nâng",
  description: "Tìm hiểu Võ Mâm Xe Nâng và dịch vụ tư vấn, cung cấp lốp, mâm, phụ tùng xe nâng.",
  alternates: { canonical: "/about" },
  openGraph: { title: "Giới thiệu Võ Mâm Xe Nâng", description: "Tìm hiểu Võ Mâm Xe Nâng và dịch vụ tư vấn, cung cấp lốp, mâm, phụ tùng xe nâng.", url: "/about" },
};

export default function Layout({ children }: { children: ReactNode }) { return children; }
