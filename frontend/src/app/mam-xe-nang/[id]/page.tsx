import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Typography } from '@mui/material';
import { PublicHeader } from '@/components/PublicHeader';
import { Footer } from '@/components/Footer';
import { SeoBreadcrumbs } from '@/components/SeoBreadcrumbs';
import { getPublicRims } from '@/lib/public-seo';
import { rimPath, rimTitle, rimDescription } from '@/lib/seo/rim-seo';
import { breadcrumbSchema, jsonLd } from '@/lib/seo/structured-data';
import { siteUrl } from '@/lib/site-config';
type Props = { params: { id: string } };
async function getRim(id: string) { return (await getPublicRims()).find(rim => rim.id === id); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rim = await getRim(params.id); if (!rim) return { title: 'Không tìm thấy mâm', robots: { index: false } };
  const title = rimTitle(rim), description = rimDescription(rim), url = siteUrl + rimPath(rim);
  return { title: { absolute: title }, description, alternates: { canonical: url }, robots: { index: true, follow: true }, openGraph: { type: 'website', title, description, url }, twitter: { card: 'summary', title, description } };
}
export default async function Page({ params }: Props) {
  const rim = await getRim(params.id); if (!rim) notFound();
  const title = rimTitle(rim), url = siteUrl + rimPath(rim);
  const crumbs = [{ name: 'Trang chủ', path: '/' }, { name: 'Mâm xe nâng', path: '/mam-xe-nang' }, { name: title, path: rimPath(rim) }];
  const schema = [{ '@context': 'https://schema.org', '@type': 'Product', name: title, sku: rim.sku, description: rimDescription(rim), url, ...(rim.brand ? { brand: { '@type': 'Brand', name: rim.brand } } : {}), ...(rim.sellingPrice && rim.sellingPrice > 0 ? { offers: { '@type': 'Offer', price: rim.sellingPrice, priceCurrency: 'VND', url } } : {}) }, breadcrumbSchema(crumbs)];
  return <><PublicHeader /><Container component="main" maxWidth="md" sx={{ py: 5 }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} /><SeoBreadcrumbs items={crumbs} />
    <Typography component="h1" variant="h3">{title}</Typography><Typography sx={{ mt: 2 }}>{rimDescription(rim)}</Typography>
    <Typography component="h2" variant="h5" sx={{ mt: 4 }}>Thông số mâm được ghi nhận</Typography>
    <dl><dt>Mã sản phẩm</dt><dd>{rim.sku}</dd><dt>Kích thước</dt><dd>{rim.size}</dd><dt>Số lỗ</dt><dd>{rim.boltHoles}</dd>{rim.brand && <><dt>Thương hiệu</dt><dd>{rim.brand}</dd></>}{rim.compatibleModels && <><dt>Thông tin dòng xe</dt><dd>{rim.compatibleModels} — cần kiểm tra model và cấu hình lắp cụ thể.</dd></>}</dl>
    <Typography>{rim.sellingPrice && rim.sellingPrice > 0 ? `${rim.sellingPrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ để xác nhận báo giá.'}</Typography>
    <Typography component="h2" variant="h5" sx={{ mt: 4 }}>Cần kiểm tra gì trước khi chọn?</Typography>
    <Typography sx={{ mt: 2 }}>Chuẩn bị ảnh mâm đang dùng, ký hiệu và thông tin model xe. Cùng size hoặc số lỗ chưa đủ để kết luận thay thế trực tiếp; hãy đối chiếu các kích thước và tình trạng thực tế trước khi lắp.</Typography>
    <ul><li><Link href="/mam-xe-nang">Xem danh mục mâm xe nâng</Link></li><li><Link href="/blog/kiem-tra-mam-xe-nang-truoc-khi-ep-lop">Hướng dẫn kiểm tra mâm trước khi ép lốp</Link></li><li><Link href="/vo-xe-nang">Đối chiếu danh mục vỏ xe nâng đang có</Link></li><li><Link href="/products">Sản phẩm và dịch vụ xe nâng</Link></li></ul>
  </Container><Footer /></>;
}
