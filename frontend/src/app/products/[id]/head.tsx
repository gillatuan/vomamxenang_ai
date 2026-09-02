import { getPublicSeoItem, seoValues } from "@/lib/public-seo";

export default async function Head({ params }: { params: { id: string } }) {
  const item = await getPublicSeoItem("products", params.id);
  if (!item) return <title>Không tìm thấy sản phẩm | Võ Mâm Xe Nâng</title>;
  const seo = seoValues(item, `/products/${params.id}`);
  const ogTitle = seo.openGraph?.title || seo.title;
  const ogDescription = seo.openGraph?.description || seo.description;
  return <>
    <title>{seo.title}</title><meta name="description" content={seo.description} />
    {seo.keywords.length > 0 && <meta name="keywords" content={seo.keywords.join(", ")} />}
    <meta name="robots" content={seo.robots} /><link rel="canonical" href={seo.canonical} />
    <meta property="og:type" content="product" /><meta property="og:title" content={ogTitle} /><meta property="og:description" content={ogDescription} /><meta property="og:url" content={seo.canonical} />
    {item.imageUrl && <meta property="og:image" content={item.imageUrl} />}
    <meta name="twitter:card" content={seo.twitter?.card || "summary_large_image"} /><meta name="twitter:title" content={seo.twitter?.title || ogTitle} /><meta name="twitter:description" content={seo.twitter?.description || ogDescription} />
  </>;
}
