import { ContentStatus } from '@prisma/client';
import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

export const createForkliftTireProductsSeed: ProductionSeed = {
  key: '003-create-forklift-tire-products',
  name: 'Create forklift tire product drafts',
  preview: { productsToCreate: forkliftTireProducts.length },
  async run(database) {
    for (const sourceProduct of forkliftTireProducts) {
      // Generated catalog content must be reviewed in Admin before publishing.
      // An empty update intentionally preserves a product that an admin already
      // created with the same slug.
      const product = { ...sourceProduct, status: ContentStatus.DRAFT };
      await database.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product,
      });
    }
  },
};
