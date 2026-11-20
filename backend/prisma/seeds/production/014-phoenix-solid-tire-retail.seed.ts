import { ContentStatus, ProductType } from '@prisma/client';
import { ProductionSeed } from './types';

/**
 * 14 Nov 2026 editorial release: retail price proposals grounded in supplier
 * quotations dated 04 Nov 2026 and 24 Jul 2026, supplied by the operator.
 *
 * These are supplier QUOTE prices, not a verified inventory purchase ledger.
 * Import cost is unknown and stays 0 (never invent true landed cost or stock).
 * No invoice, customer name, telephone number or private quotation image
 * is included in the public catalog.
 *
 * The initial 6.00-9 Phoenix catalog placeholder already exists in production
 * seed 003 with price 2,100,000. Update ONLY if it is still exactly that
 * placeholder; abort the transaction rather than overriding an admin price.
 */
export const phoenixQuotedPrices = [
  { sku: 'SEED-PHOENIX-600-9', size: '6.00-9', slug: 'lop-dac-phoenix-6-00-9-cho-nen-nhieu-vat-sac', price: 2690000, titleSize: '6.00-9', purpose: 'Kho xưởng hoạt động thường xuyên' },
  { sku: 'PHOENIX-SOLID-650-10-2026', size: '6.50-10', slug: 'vo-dac-xe-nang-phoenix-6-50-10-thai-lan', price: 3190000, titleSize: '6.50-10', purpose: 'Kho hàng và nhà xưởng' },
  { sku: 'PHOENIX-SOLID-700-12-2026', size: '7.00-12', slug: 'vo-dac-xe-nang-phoenix-7-00-12-thai-lan', price: 3790000, titleSize: '7.00-12', purpose: 'Xe nâng vận hành theo ca' },
  { sku: 'PHOENIX-SOLID-28X9-15-2026', size: '28×9-15', slug: 'vo-dac-xe-nang-phoenix-28x9-15-815-15-thai-lan', price: 4790000, titleSize: '28×9-15 (815-15)', purpose: 'Xe nâng sử dụng cỡ bánh 28×9-15' },
] as const;

function productData(entry: (typeof phoenixQuotedPrices)[number]) {
  const size = entry.titleSize;
  const name = `Vỏ đặc xe nâng PHOENIX ${size} mới 100% – Thái Lan`;
  const intro = `Đừng để việc chọn sai vỏ làm gián đoạn công việc của xe nâng. ${name} là lựa chọn dành cho khách hàng ưu tiên hàng mới, rõ kích thước và chủ động kế hoạch thay thế.`;
  const detail =
    `${intro}\n\n` +
    `Vỏ đặc không cần bơm hơi, giúp hạn chế tình huống phải dừng xe do xì hơi hoặc thủng săm. Với xe làm việc tại ${entry.purpose.toLowerCase()}, một bộ vỏ đúng cấu hình cùng việc kiểm tra mâm trước khi lắp là điều đáng đầu tư hơn việc chỉ so sánh giá mua ban đầu. Độ bền thực tế vẫn phụ thuộc tải trọng, mặt nền, cách vận hành và việc bảo dưỡng.\n\n` +
    `Sản phẩm được mô tả theo báo giá PHOENIX hàng mới 100%, xuất xứ Thái Lan. Trước khi đặt hàng, hãy gửi ảnh thông số vỏ cũ, ảnh mâm, dòng xe và vị trí bánh để chúng tôi đối chiếu kích thước, kiểu mâm và phương án ép/thay phù hợp. Không thể xác nhận tương thích chỉ từ ký hiệu cỡ vỏ.\n\n` +
    `Thông tin bảo hành trong báo giá nguồn: 03 tháng hoặc mòn đến mức 30% gai, tùy điều kiện áp dụng; chính sách cuối cùng và các trường hợp loại trừ cần được xác nhận trên báo giá/hóa đơn của cửa hàng. Giá niêm yết là giá bán đề xuất cho một chiếc vỏ; thuế GTGT, vận chuyển và công ép/thay được xác nhận riêng trước khi chốt đơn. Vui lòng liên hệ để kiểm tra tồn kho thực tế.`;
  const shortDescription =
    `PHOENIX ${size} mới 100%, vỏ đặc xuất xứ Thái Lan. Ưu tiên hàng rõ nguồn gốc, tư vấn đúng size và kiểm tra mâm trước khi thay để yên tâm vận hành.`;
  const highlights = [
    'Mới 100% – PHOENIX, xuất xứ Thái Lan theo báo giá nguồn',
    'Vỏ đặc không sử dụng hơi – hạn chế gián đoạn do xì hơi',
    'Tư vấn đối chiếu vỏ cũ, kiểu mâm và vị trí bánh trước khi lắp',
    'Bảo hành theo điều kiện được xác nhận khi mua',
    'Có thể tư vấn dịch vụ ép/thay vỏ xe nâng',
  ];
  const specifications = [
    { label: 'Thương hiệu', value: 'PHOENIX' },
    { label: 'Kích thước', value: size },
    { label: 'Loại', value: 'Vỏ đặc (solid tire)' },
    { label: 'Tình trạng', value: 'Mới 100% theo báo giá nguồn' },
    { label: 'Xuất xứ', value: 'Thái Lan theo báo giá nguồn' },
    { label: 'Bảo hành tham khảo', value: '03 tháng hoặc mức mòn 30% gai, theo điều kiện xác nhận khi mua' },
    { label: 'Tồn kho', value: 'Liên hệ xác nhận số lượng thực tế' },
    { label: 'Lưu ý', value: 'Kiểm tra kiểu mâm và cấu hình xe trước khi ép/thay' },
  ];
  return {
    name, size: entry.size, brand: 'PHOENIX', type: ProductType.TIRE,
    categoryId: 'category-tires',
    tireType: 'SOLID', condition: 'NEW_100',
    sellingPrice: entry.price,
    shortDescription, description: detail, highlights, specifications,
    applications: [
      'Kho hàng và nhà xưởng',
      'Khu xuất nhập và luân chuyển hàng hóa',
      'Xe nâng sử dụng đúng kích thước và cấu hình mâm đã kiểm tra',
    ],
    seo: {
      title: `Vỏ đặc PHOENIX ${size} mới 100% – Giá rõ ràng | Vỏ Mâm Xe Nâng`,
      description: `Vỏ đặc xe nâng PHOENIX ${size} Thái Lan, mới 100%. Xem giá bán và được tư vấn đúng size, đúng mâm, chính sách bảo hành trước khi thay.`,
      keywords: [`vỏ xe nâng PHOENIX ${size}`, `lốp đặc PHOENIX ${size}`, 'vỏ đặc xe nâng Thái Lan', 'dịch vụ ép vỏ xe nâng'],
      canonicalPath: `/products/${entry.slug}`,
      robots: 'index,follow',
    },
    tags: ['PHOENIX', 'vỏ đặc xe nâng', entry.size, 'Thái Lan', 'hàng mới', 'giá niêm yết cần xác nhận VAT'],
    status: ContentStatus.PUBLISHED,
  };
}

export const phoenixSolidTireRetail2026Seed: ProductionSeed = {
  key: '014-phoenix-solid-tire-retail-2026',
  name: 'Four Phoenix solid tire prices and quality-first product descriptions from user quotes',
  preview: { productsToCreate: 3 },
  async run(database) {
    // The operator approved retail prices after checking the confidential
    // supplier quotations. Never put acquisition prices in public Git.
    // Ensure the existing 6.00-9 product was not repriced by an operator.
    // Abort safely rather than changing a manually maintained sales price.
    // Category FK must refer to a real Category row. Seed 003 may be
    // recorded in SeedHistory while its legacy category was later removed.
    // Reuse a unique existing "Vỏ xe nâng" category rather than creating a
    // duplicate. Only create the known canonical category when none exists.
    const availableCategories = await database.category.findMany({
      where: { OR: [{ id: 'category-tires' }, { name: 'Vỏ xe nâng' }] },
      select: { id: true, name: true },
      take: 3,
    });
    if (availableCategories.length > 1 ||
        (availableCategories.length === 1 && availableCategories[0].name !== 'Vỏ xe nâng'))
      throw new Error('Ambiguous or mismatched forklift tire category; manual review required');
    const categoryId = availableCategories.length === 1
      ? availableCategories[0].id
      : (await database.category.create({
          data: {
            id: 'category-tires',
            name: 'Vỏ xe nâng',
            tireSize: 'Nhiều kích thước',
            brand: 'Nhiều thương hiệu',
            tireType: 'SOLID',
            rimType: 'STANDARD',
            origin: 'Nhiều nguồn',
            condition: 'NEW',
            specifications: 'Danh mục vỏ/lốp xe nâng',
          },
        })).id;
    const existing = phoenixQuotedPrices[0];
    const updated = await database.product.updateMany({
      where: {
        sku: existing.sku,
        brand: 'PHOENIX',
        size: existing.size,
        tireType: 'SOLID',
        condition: 'NEW_100',
        OR: [{ sellingPrice: null }, { sellingPrice: 2100000 }],
      },
      data: { ...productData(existing), categoryId },
    });
    if (!updated || (updated as { count?: number }).count !== 1)
      throw new Error('Phoenix 6.00-9 must have an unset price or the original placeholder price; manual review required');

    const newProducts = phoenixQuotedPrices.slice(1).map(entry => ({
      ...productData(entry),
      categoryId,
      id: `product-phoenix-solid-${entry.size.replace(/[^a-z0-9]/gi, '').toLowerCase()}-2026`,
      sku: entry.sku,
      slug: entry.slug,
      importPrice: 0, // unknown actual acquisition cost, never infer it from a quote
      imageUrl: null, // no verified tire photographs supplied
      rimType: null,
      minStock: 0,
      maxStock: 100,
    }));
    // Failure on conflict is intentional; do not silently drop product records.
    await database.product.createMany({ data: newProducts });
  },
};
