import { ProductionSeed } from './types';
import { editorialProducts016 } from './016-unique-product-editorial.seed';

// One-time cleanup of legacy template text persisted by old seeds. This seed
// *reads* approved Admin/DB fields and never generates a marketing paragraph.
// New content must be authored in the Admin product editor.
const legacySpecificationLabels = new Set([
  'Hồ sơ cần gửi để tư vấn',
  'Bước nghiệm thu sau lắp',
]);
const legacyDescriptions = [
  /^Tư vấn lốp (?:đặc|hơi)/i,
  /^Tư vấn lốp đặc không để lại vệt/i,
  /^Vỏ đặc xe nâng PHOENIX .* Xem giá bán và được tư vấn/i,
];
const templateApplications = new Set([
  'Kho hàng vận hành theo ca',
  'Nhà xưởng và khu sản xuất',
  'Trung tâm phân phối',
  'Khu đóng gói, xuất hàng',
  'Kho nền sáng',
  'Khu thực phẩm hoặc đóng gói',
  'Khu vực yêu cầu vệ sinh',
  'Lối đi trong nhà',
  'Sân bãi và khu giao nhận',
  'Đường nội bộ nhà máy',
  'Khu vực có ram dốc',
  'Tuyến di chuyển kho – sân',
]);
export const adminOwnedProductContentSeed017: ProductionSeed = {
  key: '017-retire-generic-product-copy',
  name: 'Keep only real Admin-authored sales copy and clean legacy SEO boilerplate',
  preview: { productsToCreate: 0 },
  async run(database) {
    const skus = editorialProducts016.map(p => p.sku);
    const db = database as typeof database & {
      product: typeof database.product & { findMany(args: unknown): Promise<Array<{
        id: string; sku: string; name: string; seo: unknown;
        shortDescription: string | null; applications: string[]; specifications: Array<{label:string; value:string}>;
      }>> };
    };
    const records = await db.product.findMany({
      where: { sku: { in: skus } },
      select: { id: true, sku: true, name: true, seo: true, shortDescription: true, applications: true, specifications: true },
    });
    for (const p of records) {
      const seo = p.seo && typeof p.seo === 'object' && !Array.isArray(p.seo)
        ? { ...p.seo } as Record<string, unknown> : {};
      let changedSeo = false;
      const oldDescription = typeof seo.description === 'string' ? seo.description.trim() : '';
      const ownSummary = typeof p.shortDescription === 'string' ? p.shortDescription.trim() : '';
      if (legacyDescriptions.some(pattern => pattern.test(oldDescription)) && ownSummary.length >= 50) {
        seo.description = ownSummary.slice(0, 160);
        changedSeo = true;
      }
      const oldTitle = typeof seo.title === 'string' ? seo.title.trim() : '';
      if (oldTitle === p.name + ' | Võ Mâm Xe Nâng' || /^Vỏ đặc PHOENIX .*Giá rõ ràng/.test(oldTitle)) {
        seo.title = p.name;
        changedSeo = true;
      }
      const generatedSpecs = Array.isArray(p.specifications) && p.specifications.some(
        (item: { label?: string }) => item && legacySpecificationLabels.has(item.label || ''),
      );
      const generatedApplications = Array.isArray(p.applications) && p.applications.length > 0 &&
        p.applications.every((item: string) => templateApplications.has(item));
      const data: Record<string, unknown> = {};
      if (changedSeo) data.seo = seo;
      // Remove only recognized legacy instruction rows, never real
      // specifications that an administrator may have added later.
      if (generatedSpecs) {
        data.specifications = p.specifications.filter(
          (item: { label: string }) => !legacySpecificationLabels.has(item.label),
        );
      }
      if (generatedApplications) data.applications = [];
      if (Object.keys(data).length === 0) continue;
      const result = await database.product.updateMany({
        where: { id: p.id, sku: p.sku, name: p.name },
        data,
      });
      if ((result as { count?: number }).count !== 1) throw new Error('Product changed during editorial cleanup: ' + p.sku);
    }
  },
};
