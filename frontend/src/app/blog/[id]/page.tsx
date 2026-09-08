import { notFound, permanentRedirect } from "next/navigation";
import { getPublicSeoItem, getRelatedCatalog, contentMetadata, contentJsonLd } from "@/lib/public-seo";
import { contentPath, linkRelatedContent } from "@/lib/content-seo";
import type { Post } from "@/lib/api-client";
import BlogDetail from "./BlogDetail";

type Props = { params: { id: string } };
export async function generateMetadata({ params }: Props) {
  const item = await getPublicSeoItem("posts", params.id);
  if (!item) return { title: "Không tìm thấy nội dung", robots: { index: false } };
  return contentMetadata(item, "blog");
}
export default async function Page({ params }: Props) {
  const item = await getPublicSeoItem("posts", params.id);
  if (!item) notFound();
  if (item.slug && params.id !== item.slug) permanentRedirect(contentPath(item, "blog"));
  const catalog = await getRelatedCatalog();
  const content = linkRelatedContent(item.content || "", catalog, { id: item.id, kind: "blog" });
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: contentJsonLd(item, "blog") }} /><BlogDetail post={{ ...item, content: content } as Post} /></>;
}
