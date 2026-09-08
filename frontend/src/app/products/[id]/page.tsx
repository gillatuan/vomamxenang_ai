import { notFound, permanentRedirect } from "next/navigation";
import { getPublicSeoItem, getRelatedCatalog, contentMetadata, contentJsonLd } from "@/lib/public-seo";
import { contentPath, linkRelatedContent } from "@/lib/content-seo";
import type { Product } from "@/lib/api-client";
import ProductDetail from "./ProductDetail";

type Props = { params: { id: string } };
export async function generateMetadata({ params }: Props) {
  const item = await getPublicSeoItem("products", params.id);
  if (!item) return { title: "Không tìm thấy nội dung", robots: { index: false } };
  return contentMetadata(item, "products");
}
export default async function Page({ params }: Props) {
  const item = await getPublicSeoItem("products", params.id);
  if (!item) notFound();
  if (item.slug && params.id !== item.slug) permanentRedirect(contentPath(item, "products"));
  const catalog = await getRelatedCatalog();
  const content = linkRelatedContent(item.description || "", catalog, { id: item.id, kind: "products" });
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contentJsonLd(item, "products") }} /><ProductDetail product={{ ...item, description: content } as Product} /></>;
}
