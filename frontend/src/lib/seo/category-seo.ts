import type { Metadata } from 'next';
import type { Product } from '../api-client';
import { siteUrl } from '../site-config';
export type TopicSlug = 'vo-xe-nang' | 'lop-dac-xe-nang' | 'mam-xe-nang';
export const topics = {
  'vo-xe-nang': {
    title: 'Vỏ xe nâng | Chọn lốp theo kích thước và điều kiện vận hành', heading: 'Vỏ xe nâng', keyword: 'vỏ xe nâng',
    description: 'Xem các loại vỏ xe nâng đang có trong danh mục, đối chiếu kích thước và thương hiệu. Tham khảo hướng dẫn chọn lốp đặc, lốp hơi và mâm phù hợp.',
    intro: 'Vỏ xe nâng, còn gọi là lốp xe nâng, cần được lựa chọn cùng với cấu hình mâm và điều kiện làm việc của xe. Danh mục dưới đây giúp bạn đối chiếu các thông tin đang có trước khi yêu cầu tư vấn.',
    guidance: ['Ghi lại ký hiệu trên vỏ cũ và thông tin xe; không chỉ chọn theo tên hãng.', 'Đối chiếu loại vỏ, cấu hình mâm và hướng dẫn của nhà sản xuất xe.', 'Mô tả nền kho, sân bãi và thời gian vận hành để trao đổi phương án phù hợp.'],
    faq: [ ['Vỏ xe nâng có những loại nào?', 'Danh mục hiện có vỏ đặc và vỏ hơi. Bạn có thể xem loại và kích thước trên từng sản phẩm, sau đó đối chiếu cấu hình xe trước khi lựa chọn.'], ['Giá vỏ xe nâng phụ thuộc vào thông tin nào?', 'Kích thước, thương hiệu, loại vỏ, tình trạng và phạm vi lắp đặt là các thông tin cần cung cấp khi hỏi giá. Sản phẩm chưa niêm yết giá cần được xác nhận báo giá riêng.'], ['Có thể chọn vỏ chỉ theo hãng xe không?', 'Tên hãng chưa đủ để kết luận tương thích. Cần kiểm tra thông số bánh, mâm và model xe thực tế.'] ],
  },
  'lop-dac-xe-nang': {
    title: 'Vỏ đặc xe nâng | Kích thước, sản phẩm và hướng dẫn chọn', heading: 'Vỏ đặc xe nâng', keyword: 'vỏ đặc xe nâng',
    description: 'Danh mục lốp đặc xe nâng theo size và thương hiệu thực tế. Đối chiếu mâm, vị trí bánh và điều kiện nền kho trước khi chọn vỏ.',
    intro: 'Lốp đặc là một nhánh trong danh mục vỏ xe nâng. Khi xem các lựa chọn dưới đây, hãy kiểm tra ký hiệu vỏ, loại mâm và yêu cầu của xe thay vì coi cùng kích thước là có thể thay thế trực tiếp.',
    guidance: ['Đọc size trên vỏ cũ và đối chiếu với thông tin sản phẩm.', 'Trao đổi cấu hình mâm và phương án tháo lắp trước khi đặt hàng.', 'Với yêu cầu nền sạch hoặc điều kiện làm việc đặc biệt, cần xác nhận đúng loại vỏ với đơn vị tư vấn.'],
    faq: [ ['Vỏ đặc cùng size có lắp được trên mọi xe không?', 'Không thể kết luận chỉ từ size. Cần kiểm tra mâm, cấu hình xe và thông tin kỹ thuật của sản phẩm.'], ['Khi nào nên thay vỏ đặc?', 'Cần kiểm tra thực tế và đối chiếu giới hạn sử dụng của nhà sản xuất. Không dùng một số giờ vận hành chung cho mọi loại vỏ và mọi điều kiện làm việc.'], ['Có thể xem sản phẩm cùng kích thước ở đâu?', 'Kích thước được hiển thị trên các sản phẩm trong danh mục. Trang chi tiết cũng có liên kết tới sản phẩm liên quan để bạn đối chiếu.'] ],
  },
  'mam-xe-nang': {
    title: 'Mâm xe nâng | Thông số và cách đối chiếu với vỏ', heading: 'Mâm xe nâng', keyword: 'mâm xe nâng',
    description: 'Xem mâm xe nâng theo kích thước, số lỗ và thông tin model đang được ghi nhận. Đối chiếu mâm thực tế trước khi chọn vỏ hoặc thực hiện ép lắp.',
    intro: 'Mâm bánh xe nâng là phần cần được kiểm tra cùng với vỏ. Danh mục mâm dưới đây hiển thị thông số đang được ghi nhận; số lỗ hoặc tên hãng xe riêng lẻ chưa đủ để xác nhận một bộ bánh phù hợp.',
    guidance: ['Chuẩn bị ảnh mâm đang sử dụng, ký hiệu và thông tin model xe.', 'Đối chiếu số lỗ, kiểu lắp và các kích thước cần thiết với người phụ trách kỹ thuật.', 'Kiểm tra tình trạng mâm trước khi tháo lắp; tham khảo hướng dẫn kiểm tra và yêu cầu khảo sát nếu thông tin chưa rõ.'],
    faq: [ ['Mâm xe nâng cùng số lỗ có thay thế cho nhau được không?', 'Cùng số lỗ chưa đủ để xác nhận tương thích. Cần đối chiếu các kích thước và cấu hình lắp thực tế.'], ['Size mâm có thể dùng để suy ra đang có vỏ cùng size không?', 'Không. Danh mục mâm và vỏ là dữ liệu riêng; cần kiểm tra sản phẩm vỏ đang được cung cấp và xác nhận phương án lắp.'], ['Cần cung cấp gì để hỏi mâm phù hợp?', 'Gửi ký hiệu mâm, số lỗ, ảnh thực tế và thông tin model xe. Những thông số chưa có cần được đo hoặc xác minh trước khi kết luận.'] ],
  },
} satisfies Record<TopicSlug, { title: string; heading: string; keyword: string; description: string; intro: string; guidance: string[]; faq: string[][] }>;
export function topicProducts(slug: TopicSlug, products: Product[]) {
  return products.filter(p => !p.seo?.robots?.includes('noindex') && p.status !== 'DRAFT' && (slug === 'vo-xe-nang' ? p.type === 'TIRE' : slug === 'lop-dac-xe-nang' ? p.type === 'TIRE' && p.tireType === 'SOLID' : p.type === 'RIM'));
}
export function topicMetadata(slug: TopicSlug, noindex = false): Metadata {
  const topic = topics[slug]; const url = `${siteUrl}/${slug}`;
  return { title: { absolute: topic.title }, description: topic.description, alternates: { canonical: url }, robots: { index: !noindex, follow: true }, openGraph: { type: 'website', title: topic.title, description: topic.description, url }, twitter: { card: 'summary', title: topic.title, description: topic.description } };
}
