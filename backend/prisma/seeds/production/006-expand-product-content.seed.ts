import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

type CatalogProduct = (typeof forkliftTireProducts)[number];

const usageByTireType: Record<string, { label: string; detail: string; applications: string[]; checks: string[] }> = {
  SOLID: {
    label: 'lốp đặc',
    detail: 'Lốp không dùng hơi phù hợp để tham khảo cho nhịp vận hành trong kho, nhà xưởng và các tuyến di chuyển lặp lại. Điều kiện nền, tải làm việc, vị trí bánh và cấu hình mâm vẫn cần được xác nhận trước khi chốt phương án.',
    applications: ['Kho hàng vận hành theo ca', 'Nhà xưởng và khu sản xuất', 'Trung tâm phân phối', 'Khu đóng gói, xuất hàng'],
    checks: ['Kiểm tra ký hiệu trên hông lốp cũ', 'Đối chiếu kiểu mâm và bề mặt lắp', 'So sánh độ mòn của hai bánh cùng trục'],
  },
  NON_MARKING: {
    label: 'lốp đặc không để lại vệt',
    detail: 'Lốp được định hướng cho khu vực cần hạn chế dấu bánh trên nền. Ngoài kích thước, doanh nghiệp nên mô tả màu và chất liệu nền, độ dốc, điểm quay đầu và yêu cầu vệ sinh để được tư vấn sát thực tế.',
    applications: ['Kho nền sáng', 'Khu thực phẩm hoặc đóng gói', 'Khu vực yêu cầu vệ sinh', 'Lối đi trong nhà'],
    checks: ['Đọc đầy đủ ký hiệu lốp hiện hữu', 'Kiểm tra loại mâm đang dùng', 'Đánh giá độ chênh lệch hai bánh cùng trục'],
  },
  PNEUMATIC: {
    label: 'lốp hơi',
    detail: 'Lốp hơi được đưa vào catalog cho các tuyến xe có sân bãi, nền chuyển tiếp hoặc mặt bằng không đồng đều. Người vận hành cần duy trì kiểm tra áp suất, van và tình trạng hông lốp theo quy trình kỹ thuật của xe.',
    applications: ['Sân bãi và khu giao nhận', 'Đường nội bộ nhà máy', 'Khu vực có ram dốc', 'Tuyến di chuyển kho – sân'],
    checks: ['Xác nhận kiểu mâm và van lốp', 'Kiểm tra áp suất theo hướng dẫn của xe', 'Quan sát dấu hiệu mòn lệch hoặc mất áp'],
  },
};

function makeContent(product: CatalogProduct) {
  const usage = usageByTireType[product.tireType] ?? usageByTireType.SOLID;
  const brand = product.brand ? ` ${product.brand}` : '';
  const size = product.size ?? 'theo kích thước thực tế';
  const rim = product.rimType ? `Mâm ${product.rimType}` : 'Mâm cần xác nhận thực tế';
  const condition = product.condition === 'USED' ? 'Sản phẩm đã qua sử dụng cần được kiểm tra trực tiếp từng chiếc trước khi báo giá.' : 'Catalog mô tả sản phẩm mới; tồn kho và cấu hình thực tế được xác nhận trước khi bàn giao.';

  return {
    shortDescription: `${product.name} là phương án ${usage.label} tham khảo theo kích thước ${size}. Gửi ảnh hông lốp, mâm và vị trí bánh để được đối chiếu trước khi lắp.`,
    description: `${product.name} được biên tập cho khách hàng đang cần thay lốp xe nâng theo kích thước ${size}. ${usage.detail}\n\nQuy trình tư vấn nên bắt đầu từ thông tin trên xe thay vì chỉ chọn theo tên sản phẩm: ảnh hông lốp cũ, ảnh mặt mâm, dòng xe, vị trí bánh trước/sau, tải làm việc và điều kiện mặt nền. Các dữ liệu này giúp kiểm tra sự phù hợp về kích thước, cấu hình mâm và nhu cầu vận hành, đồng thời hạn chế thay sai cấu hình.\n\nKhi tháo lốp cũ, nên quan sát mâm, bu-lông, van (với lốp hơi) và dấu hiệu mòn không đều. Sau khi lắp, cần siết theo quy trình kỹ thuật, chạy thử ở tốc độ thấp và ghi nhận ngày thay để theo dõi. ${condition}`,
    highlights: [
      `Tham chiếu kích thước ${size} và đối chiếu trực tiếp trên xe`,
      `Định hướng sử dụng: ${usage.label}`,
      ...usage.checks.slice(0, 2),
      'Khuyến nghị chạy thử và theo dõi mòn sau bàn giao',
    ],
    specifications: [
      { label: 'Kích thước tham chiếu', value: size },
      { label: 'Cấu hình sản phẩm', value: usage.label },
      { label: 'Thương hiệu catalog', value: product.brand ?? 'Cần xác nhận theo báo giá' },
      { label: 'Kiểu mâm cần đối chiếu', value: rim },
      { label: 'Tình trạng', value: product.condition === 'USED' ? 'Đã qua sử dụng — kiểm tra trực tiếp trước khi chốt' : 'Mới — xác nhận tồn kho trước khi đặt' },
      { label: 'Hồ sơ cần gửi để tư vấn', value: 'Ảnh lốp cũ, ảnh mâm, dòng xe, vị trí bánh và môi trường vận hành' },
      { label: 'Bước nghiệm thu sau lắp', value: 'Kiểm tra độ ổn định, hiện tượng rung/lệch lái và lịch theo dõi mòn' },
    ],
    applications: usage.applications,
    seo: {
      title: `${product.name} | Võ Mâm Xe Nâng`,
      description: `Tư vấn ${usage.label}${brand} kích thước ${size} cho xe nâng. Đối chiếu lốp cũ, mâm, vị trí bánh và điều kiện vận hành trước khi lắp.`,
      keywords: [product.name, `${usage.label} xe nâng`, `lốp xe nâng ${size}`, product.brand ?? 'vỏ xe nâng', 'thay lốp xe nâng', 'mâm xe nâng'],
      canonicalPath: `/products/${product.id}`,
      robots: 'index,follow',
      openGraph: { title: `${product.name} | Võ Mâm Xe Nâng`, description: `Thông tin lựa chọn ${usage.label} ${size}, các bước đối chiếu mâm và tư vấn lắp đặt.`, type: 'product' },
      twitter: { card: 'summary_large_image', title: `${product.name} | Võ Mâm Xe Nâng`, description: `Thông tin lựa chọn ${usage.label} ${size} cho xe nâng.` },
    },
    tags: [...new Set([...(product.tags ?? []), usage.label, 'tư vấn lốp xe nâng', 'kiểm tra mâm', 'lắp đặt xe nâng'])],
  };
}

const baseProducts = forkliftTireProducts.map((product) => ({ id: product.id, ...makeContent(product) }));

const serviceProducts = [
  {
    id: 'product-1', name: 'Lốp đặc xe nâng 6.00-9 cho kho xưởng', tireType: 'SOLID', size: '6.00-9', brand: null, rimType: 'CLICK', condition: 'NEW_100', tags: ['lốp đặc xe nâng', '6.00-9', 'kho xưởng'],
  },
  {
    id: 'product-2', name: 'Lốp hơi xe nâng 7.00-12 cho sân bãi', tireType: 'PNEUMATIC', size: '7.00-12', brand: null, rimType: 'LIP', condition: 'NEW_100', tags: ['lốp hơi xe nâng', '7.00-12', 'sân bãi'],
  },
].map((product) => ({ id: product.id, ...makeContent(product as CatalogProduct) }));

const installationService = {
  id: 'product-3',
  shortDescription: 'Dịch vụ khảo sát, thay lốp và ép mâm theo tình trạng thực tế của xe nâng; phù hợp khi cần xác nhận đúng cấu hình trước khi bố trí thi công.',
  description: 'Dịch vụ được thiết kế cho doanh nghiệp cần kiểm tra tổng thể bánh xe nâng trước khi thay lốp hoặc ép mâm. Kỹ thuật viên tiếp nhận thông tin dòng xe, vị trí bánh, ảnh hông lốp, ảnh mâm, tải làm việc và điều kiện mặt nền để đề xuất phương án phù hợp.\n\nKhi khảo sát, cần kiểm tra ký hiệu lốp, kiểu mâm, độ mòn của các bánh cùng trục, bu-lông, van (nếu dùng lốp hơi) và các dấu hiệu rung hoặc lệch lái. Việc này giúp phân biệt nhu cầu thay lốp thông thường với trường hợp cần kiểm tra thêm mâm hoặc cụm lái.\n\nSau khi lắp hoặc ép mâm, xe được khuyến nghị chạy thử ở tốc độ thấp và ghi nhận tình trạng vận hành. Khách hàng nên lưu ngày thay, vị trí bánh và nhận xét về mặt nền để tiện theo dõi bảo trì trong các lần tiếp theo.',
  highlights: ['Khảo sát theo dòng xe, vị trí bánh và mặt nền vận hành', 'Đối chiếu lốp cũ, mâm và thông tin kỹ thuật trước thi công', 'Kiểm tra dấu hiệu mòn lệch, rung hoặc lệch lái', 'Hướng dẫn nghiệm thu và theo dõi sau khi lắp', 'Báo giá sau khi xác nhận đúng cấu hình thực tế'],
  specifications: [
    { label: 'Phạm vi dịch vụ', value: 'Khảo sát, tư vấn thay lốp, ép mâm và kiểm tra sau lắp' },
    { label: 'Thông tin cần chuẩn bị', value: 'Ảnh lốp cũ, ảnh mâm, dòng xe, vị trí bánh, tình trạng vận hành' },
    { label: 'Hạng mục cần đối chiếu', value: 'Kích thước lốp, kiểu mâm, độ mòn cùng trục, van và bu-lông' },
    { label: 'Nghiệm thu sau thi công', value: 'Chạy thử, kiểm tra độ ổn định và lập lịch theo dõi' },
  ],
  applications: ['Bảo trì định kỳ đội xe nâng', 'Thay lốp theo kế hoạch', 'Xử lý xe rung, mòn lệch hoặc lái không ổn định', 'Kiểm tra mâm trước khi thay lốp mới'],
  seo: {
    title: 'Khảo sát, thay lốp và ép mâm xe nâng | Võ Mâm Xe Nâng',
    description: 'Dịch vụ khảo sát, thay lốp và ép mâm xe nâng theo cấu hình thực tế. Kiểm tra lốp cũ, mâm, vị trí bánh và điều kiện vận hành trước khi thi công.',
    keywords: ['thay lốp xe nâng', 'ép mâm xe nâng', 'khảo sát bánh xe nâng', 'bảo trì xe nâng'],
    canonicalPath: '/products/product-3', robots: 'index,follow',
    openGraph: { title: 'Khảo sát, thay lốp và ép mâm xe nâng', description: 'Tư vấn và thi công theo cấu hình bánh xe thực tế.', type: 'product' },
    twitter: { card: 'summary_large_image', title: 'Dịch vụ lốp và mâm xe nâng', description: 'Khảo sát, thay lốp và ép mâm theo cấu hình thực tế.' },
  },
  tags: ['thay lốp xe nâng', 'ép mâm xe nâng', 'khảo sát xe nâng', 'bảo trì xe nâng'],
};

export const expandProductContentSeed: ProductionSeed = {
  key: '006-expand-product-content',
  name: 'Mở rộng nội dung tư vấn, thông số và SEO cho catalog lốp xe nâng',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const product of [...baseProducts, ...serviceProducts, installationService]) {
      await database.product.update({ where: { id: product.id }, data: product });
    }
  },
};
