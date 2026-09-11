import { siteUrl } from "@/lib/site-config";
import { jsonLd, siteSchema } from "@/lib/seo/structured-data";
import type { Metadata } from "next";
import HomePage from "./HomePage";

const title = 'Vỏ mâm xe nâng | Vỏ xe nâng, lốp đặc và mâm';
const description = 'Tìm hiểu vỏ mâm xe nâng: danh mục lốp đặc, lốp hơi, thông số mâm và hướng dẫn lựa chọn theo kích thước, cấu hình xe, điều kiện vận hành.';
export const metadata: Metadata = { title: { absolute: title }, description, keywords: ['vỏ mâm xe nâng', 'vỏ xe nâng', 'mâm xe nâng'], alternates: { canonical: siteUrl }, openGraph: { type: 'website', title, description, url: siteUrl }, twitter: { card: 'summary_large_image', title, description } };
export default function Page() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteSchema()) }} /><HomePage /></>; }
