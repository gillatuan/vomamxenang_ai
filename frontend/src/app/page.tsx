import { siteUrl } from "@/lib/site-config";
import type { Metadata } from "next";
import HomePage from "./HomePage";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Page() { return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Võ Mâm Xe Nâng", url: siteUrl }).replace(/</g, "\\u003c") }} /><HomePage /></>; }
