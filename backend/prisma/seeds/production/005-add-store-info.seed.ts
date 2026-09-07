import { ProductionSeed } from './types';

const storeInfo = {
  id: 'store-vomamxenang',
  name: 'Võ Mâm Xe Nâng',
  address: 'TP. Hồ Chí Minh, Việt Nam',
  phone: '0905 123 456',
  email: 'info@vomamxenang.com',
  website: 'https://www.vomamxenang.com',
  facebookUrl: null,
  businessHours: 'Liên hệ để được tư vấn và báo giá.',
  notes: 'Chuyên cung cấp lốp, mâm và giải pháp bảo dưỡng xe nâng. Chúng tôi tư vấn theo tải trọng, điều kiện mặt bằng và tần suất vận hành thực tế.',
  isActive: true,
};

export const addStoreInfoSeed: ProductionSeed = {
  key: '005-add-store-info',
  name: 'Add public Võ Mâm Xe Nâng store information',
  preview: { productsToCreate: 0 },
  async run(database) {
    await database.storeInfo.upsert({ where: { id: storeInfo.id }, update: storeInfo, create: storeInfo });
  },
};
