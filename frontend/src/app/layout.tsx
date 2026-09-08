import { siteUrl } from "@/lib/site-config";
import type { Metadata } from "next";
import { ClientWrapper } from "@/app/client-wrapper";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Võ Mâm Xe Nâng", template: "%s | Võ Mâm Xe Nâng" },
  description: "Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao",
  keywords: ["vỏ xe nâng", "lốp xe nâng", "mâm xe nâng", "phụ tùng xe nâng"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "vi_VN", siteName: "Võ Mâm Xe Nâng", title: "Võ Mâm Xe Nâng", description: "Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao" },
  twitter: { card: "summary_large_image" },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
