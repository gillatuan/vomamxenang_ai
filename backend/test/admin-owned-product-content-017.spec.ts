import { adminOwnedProductContentSeed017 } from '../prisma/seeds/production/017-admin-owned-product-content.seed';

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };

async function main() {
  const changes: any[] = [];
  const shared = { id: 'product-1', name: 'Mẫu thử', sku: 'SEED-NEXEN-600-9' };
  const db: any = {
    product: {
      findMany: async () => [
        { ...shared,
          seo: { title: 'Mẫu thử | Võ Mâm Xe Nâng', description: 'Tư vấn lốp đặc NEXEN kích thước 6.00-9 cho xe nâng. Đối chiếu lốp cũ, mâm, vị trí bánh và điều kiện vận hành trước khi lắp.', custom: 'do-not-overwrite' },
          shortDescription: 'Mô tả do nhân viên tư vấn nhập riêng cho sản phẩm, bao gồm cách chọn và nhu cầu thực tế của khách hàng.',
          specifications: [{ label: 'Hồ sơ cần gửi để tư vấn', value: 'Boilerplate' }],
          applications: ['Kho hàng vận hành theo ca', 'Trung tâm phân phối'],
        },
        { id: 'product-2', name: 'Sản phẩm do quản trị viên cập nhật', sku: 'SEED-CASUMINA-600-9',
          seo: { title: 'Tư vấn vỏ xe nâng chuyên biệt | Shop', description: 'Đã biên tập trực tiếp trên Admin, thông tin chi tiết và chính sách bán hàng riêng.' },
          shortDescription: 'Mô tả của admin.', specifications: [{ label: 'Quy cách thực tế', value: 'Theo tem sản phẩm' }],
          applications: ['Đã xác nhận đúng với khách'],
        },
      ],
      updateMany: async ({ where, data }: any) => {
        assert(where.id === 'product-1', 'Only legacy generated content should be modified');
        assert(!('sellingPrice' in data) && !('description' in data) && !('shortDescription' in data) && !('tags' in data), 'Must preserve reviewed copy, prices and VAT');
        changes.push(data);
        return { count: 1 };
      },
    },
  };
  await adminOwnedProductContentSeed017.run(db);
  assert(changes.length === 1, 'Admin custom SEO/applications must not be overwritten');
  const change = changes[0];
  assert(change.seo.title === 'Mẫu thử', 'Legacy generated title should be replaced with product name');
  assert(change.seo.description.startsWith('Mô tả do nhân viên tư vấn'), 'Legacy SEO description must use saved Admin sales summary');
  assert(change.seo.custom === 'do-not-overwrite', 'SEO custom fields preserved');
  assert(change.specifications.length === 0 && change.applications.length === 0, 'Only recognizable generic content removed');
  console.log('Seed 017 checks passed: legacy template detection and Admin content preservation.');
}
main().catch(err => { console.error(err); process.exitCode = 1; });
