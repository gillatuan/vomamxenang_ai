import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kiến thức lốp và mâm xe nâng",
  description: "Hướng dẫn chọn lốp, đọc thông số, kiểm tra mâm và bảo dưỡng xe nâng trong kho xưởng.",
  alternates: { canonical: "/blog" },
  openGraph: { title: "Kiến thức lốp và mâm xe nâng", description: "Hướng dẫn chọn lốp, đọc thông số, kiểm tra mâm và bảo dưỡng xe nâng trong kho xưởng.", url: "/blog" },
};

export default function Layout({ children }: { children: ReactNode }) { return children; }
