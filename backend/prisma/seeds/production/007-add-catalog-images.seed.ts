import { forkliftTireProducts } from '../products/forklift-tires';
import { ProductionSeed } from './types';

const additionalProductImages = [
  { id: 'product-1', imageUrl: '/images/products/solid-warehouse.png' },
  { id: 'product-2', imageUrl: '/images/products/pneumatic-outdoor.png' },
  { id: 'product-3', imageUrl: '/images/products/tire-rim-service.png' },
];

export const addCatalogImagesSeed: ProductionSeed = {
  key: '007-add-catalog-images',
  name: 'Gắn ảnh catalog gốc cho sản phẩm và dịch vụ xe nâng',
  preview: { productsToCreate: 0 },
  async run(database) {
    for (const product of [...forkliftTireProducts, ...additionalProductImages]) {
      await database.product.update({ where: { id: product.id }, data: { imageUrl: product.imageUrl } });
    }
  },
};
