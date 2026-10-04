import { ContentStatus } from '@prisma/client';
import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

export const createForkliftTireProductsSeed: ProductionSeed = {
  key: '003-create-forklift-tire-products',
  name: 'Create forklift tire product drafts',
  preview: { productsToCreate: forkliftTireProducts.length },
  async run(database) {
    await database.category.upsert({
      where: { id: 'category-tires' },
      update: { name: 'Vỏ xe nâng' },
      create: { id: 'category-tires', name: 'Vỏ xe nâng', tireSize: 'Nhiều kích thước', brand: 'Nhiều thương hiệu', tireType: 'SOLID', rimType: 'STANDARD', origin: 'Nhiều nguồn', condition: 'NEW', specifications: 'Danh mục vỏ/lốp xe nâng' },
    });
    // A single insert keeps the interactive transaction well below Prisma
    // Accelerate's timeout. skipDuplicates protects manual/admin products that
    // already use a catalog slug and never overwrites their fields.
    await database.product.createMany({
      data: forkliftTireProducts.map((product) => ({ ...product, status: ContentStatus.DRAFT })),
      skipDuplicates: true,
    });
  },
};
