import { ContentStatus } from '@prisma/client';
import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

export const createForkliftTireProductsSeed: ProductionSeed = {
  key: '003-create-forklift-tire-products',
  name: 'Create forklift tire product drafts',
  preview: { productsToCreate: forkliftTireProducts.length },
  async run(database) {
    // A single insert keeps the interactive transaction well below Prisma
    // Accelerate's timeout. skipDuplicates protects manual/admin products that
    // already use a catalog slug and never overwrites their fields.
    await database.product.createMany({
      data: forkliftTireProducts.map((product) => ({ ...product, status: ContentStatus.DRAFT })),
      skipDuplicates: true,
    });
  },
};
