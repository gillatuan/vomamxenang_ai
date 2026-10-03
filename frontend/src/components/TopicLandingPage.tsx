import Link from 'next/link';
import { ContentImage } from './ContentImage';
import { Box, Container, Grid, Typography } from '@mui/material';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { SeoBreadcrumbs } from './SeoBreadcrumbs';
import { getPublicCollection, getPublicRims } from '@/lib/public-seo';
import { contentPath } from '@/lib/content-seo';
import type { Product } from '@/lib/api-client';
import { topics, TopicSlug, topicProducts } from '@/lib/seo/category-seo';
import { rimPath, rimTitle } from '@/lib/seo/rim-seo';
import { breadcrumbSchema, jsonLd } from '@/lib/seo/structured-data';
import { siteUrl } from '@/lib/site-config';
import { productFallbackImage, productSeoDescription } from '@/lib/product-content';

export async function TopicLandingPage({ slug }: { slug: TopicSlug }) {
  const [products, rims] = await Promise.all([getPublicCollection('products'), slug === 'mam-xe-nang' ? getPublicRims() : Promise.resolve([])]);
  const topic = topics[slug]; const selected = topicProducts(slug, products as Product[]);
  const crumbs = [{ name: 'Trang chủ', path: '/' }, ...(slug === 'lop-dac-xe-nang' ? [{ name: 'Vỏ xe nâng', path: '/vo-xe-nang' }] : []), { name: topic.heading, path: `/${slug}` }];
  const entries = [...selected.map(p => ({ path: contentPath(p, 'products'), title: p.name, facts: [p.size, p.brand].filter(Boolean).join(' · '), description: productSeoDescription(p), image: p.imageUrl, fallback: productFallbackImage(p), alt: p.seo?.imageAlt || `${p.name}${p.size ? ` ${p.size}` : ''}` })), ...rims.map(r => ({ path: rimPath(r), title: rimTitle(r), facts: r.compatibleModels ? `Dòng xe ghi nhận: ${r.compatibleModels}; cần đối chiếu cấu hình.` : '', description: 'Mâm xe nâng cần được đối chiếu kích thước lốp, số lỗ bu-lông, đường kính tâm và cấu hình moay-ơ trước khi lắp.', image: undefined, fallback: '/images/products/tire-rim-service.png', alt: rimTitle(r) }))];
  const schema = [breadcrumbSchema(crumbs), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: topic.heading, description: topic.description, url: `${siteUrl}/${slug}`, mainEntity: { '@type': 'ItemList', itemListElement: entries.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, name: entry.title, url: siteUrl + entry.path })) } }];
  return <><PublicHeader /><Container component="main" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 6, md: 10 } }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <SeoBreadcrumbs items={crumbs} /><Typography sx={{ mt: 3, mb: 1, fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main" }}>CHUYÊN MỤC SẢN PHẨM</Typography><Typography component="h1" variant="h2" gutterBottom>{topic.heading}</Typography>
    <Typography sx={{ maxWidth: 900, fontSize: { xs: "1rem", md: "1.18rem" }, lineHeight: 1.8, mb: 6 }}>{topic.intro}</Typography>
    <Typography component="h2" variant="h3" sx={{ mb: 3 }}>{slug === 'mam-xe-nang' ? 'Mâm xe nâng đang có' : 'Sản phẩm theo nhu cầu vận hành'}</Typography>
    <Grid container spacing={3}>{entries.map(entry => <Grid item xs={12} sm={6} md={4} key={entry.path}><Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, height: '100%' }}>
      <ContentImage src={entry.image} fallbackSrc={entry.fallback} alt={entry.alt || entry.title} sx={{ height: { xs: 260, md: 300 } }} />
      <Typography component="h3" variant="h5" sx={{ mt: 2 }}><Link href={entry.path}>{entry.title}</Link></Typography><Typography sx={{ mt: 1, fontWeight: 700 }}>{entry.facts}</Typography><Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.65 }}>{entry.description}</Typography>
    </Box></Grid>)}</Grid>
    {!entries.length && <Typography>Danh mục đang cập nhật. Vui lòng xem hướng dẫn dưới đây và liên hệ để xác nhận sản phẩm.</Typography>}
    <Box component="section" sx={{ mt: 5 }}><Typography component="h2" variant="h4">Thông tin cần đối chiếu trước khi chọn</Typography><ol>{topic.guidance.map(point => <li key={point} style={{ marginTop: 12 }}>{point}</li>)}</ol></Box>
    <Box component="section" sx={{ mt: 4 }}><Typography component="h2" variant="h4">Câu hỏi thường gặp</Typography>{topic.faq.map(([question, answer]) => <details key={question} style={{ padding: '16px 0', borderBottom: '1px solid #ddd' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>{question}</summary><p>{answer}</p></details>)}</Box>
    <Box component="section" sx={{ mt: 4 }}><Typography component="h2" variant="h4">Tìm hiểu thêm trước khi đặt hàng</Typography><ul>
      <li><Link href="/blog/doc-thong-so-lop-xe-nang-truoc-khi-thay">Cách đọc thông số vỏ xe nâng</Link></li>
      <li><Link href={slug === 'mam-xe-nang' ? '/blog/kiem-tra-mam-xe-nang-truoc-khi-ep-lop' : '/blog/chon-lop-dac-hay-lop-hoi-cho-xe-nang'}>{slug === 'mam-xe-nang' ? 'Kiểm tra mâm trước khi ép lắp' : 'So sánh lốp đặc và lốp hơi'}</Link></li>
      {Object.entries(topics).filter(([key]) => key !== slug).map(([key, value]) => <li key={key}><Link href={`/${key}`}>{value.heading}</Link></li>)}
      <li><Link href="/products">Xem toàn bộ sản phẩm và dịch vụ</Link></li>
    </ul></Box>
  </Container><Footer /></>;
}
