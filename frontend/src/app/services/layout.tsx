import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dịch vụ vỏ & mâm xe nâng | Võ Mâm Xe Nâng",
  description: "Dịch vụ ép, thay vỏ và tư vấn vỏ mâm xe nâng theo kích thước, tình trạng bánh và nhu cầu vận hành thực tế.",
  alternates: { canonical: "/services" },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
