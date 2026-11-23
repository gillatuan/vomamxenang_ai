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

// Legacy seed 014 is a one-time catalog identity / price bootstrap only.
// Public-facing content must be entered and approved in the Admin product form.
// Existing production editorial copy from seed 016 is stored in Product fields.
function initialProductFields(entry: (typeof phoenixQuotedPrices)[number]) {
  return {
    name: `Vỏ đặc xe nâng PHOENIX ${entry.titleSize} mới 100% – Thái Lan`,
    size: entry.size,
    brand: 'PHOENIX',
    type: ProductType.TIRE,
    categoryId: 'category-tires',
    tireType: 'SOLID',
    condition: 'NEW_100',
    sellingPrice: entry.price,
    // Deliberately no generated marketing descriptions, highlights, SEO text
    // or unverified technical/application claims in the product seed.
    shortDescription: '',
    description: '',
    highlights: [],
    specifications: [],
    applications: [],
    seo: {},
    tags: ['PHOENIX', 'vỏ đặc xe nâng', entry.size, 'Thái Lan', 'hàng mới', 'giá niêm yết cần xác nhận VAT'],
    status: ContentStatus.PUBLISHED,
  };
}

export const phoenixSolidTireRetail2026Seed: ProductionSeed = {
  key: '014-phoenix-solid-tire-retail-2026',
  name: 'Four Phoenix solid tire prices and quality-first product descriptions from user quotes',
  preview: { productsToCreate: 3 },
  async run(database) {
    // The production category may be absent even when legacy products exist:
    // categoryId is nullable and older production seeds can be skipped. Create
    // only the missing category within the same transaction as these products,
    // and never overwrite any admin-managed category metadata.
    await database.category.upsert({
      where: { id: 'category-tires' },
      update: {},
      create: {
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
    });
    // The operator approved retail prices after checking the confidential
    // supplier quotations. Never put acquisition prices in public Git.
    // Ensure the existing 6.00-9 product was not repriced by an operator.
    // Abort safely rather than changing a manually maintained sales price.
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
      data: initialProductFields(existing),
    });
    if (!updated || (updated as { count?: number }).count !== 1)
      throw new Error('Phoenix 6.00-9 must have an unset price or the original placeholder price; manual review required');

    const newProducts = phoenixQuotedPrices.slice(1).map(entry => ({
      ...initialProductFields(entry),
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
