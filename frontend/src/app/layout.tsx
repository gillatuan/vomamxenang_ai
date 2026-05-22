import type { Metadata } from "next";
import { ClientWrapper } from "@/app/client-wrapper";

export const metadata: Metadata = {
  title: "Võ Mâm Xe Nâng",
  description: "Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
