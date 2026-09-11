import { SeoBreadcrumbs } from '@/components/SeoBreadcrumbs';
import { RelatedContentNav } from "@/components/RelatedContentNav";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublicSeoItem, getRelatedCatalog, contentMetadata, contentJsonLd, contentBreadcrumbs } from "@/lib/public-seo";
import { contentPath, relatedContent } from "@/lib/content-seo";
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
  const related = relatedContent({ ...item, kind: "products" }, catalog);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contentJsonLd(item, "products") }} /><ProductDetail breadcrumbs={<SeoBreadcrumbs items={contentBreadcrumbs(item, "products")} />} product={item as Product} related={<RelatedContentNav items={related} />} /></>;
}
