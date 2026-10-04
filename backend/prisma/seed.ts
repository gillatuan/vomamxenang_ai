import { config } from 'dotenv';
import { PrismaClient, Role, TireCondition, TireType, RimType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { assertForkliftTireSeedQuality, forkliftTireProducts } from './seeds/products/forklift-tires';

// Prisma's standalone seed command does not load Nest's ConfigModule.
// Load the same local file used by `yarn dev`, while preserving a supplied DATABASE_URL.
config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const users = [
    { id: 'user-admin', email: 'admin@vomamxenang.local', password, role: Role.ADMIN_MANAGER },
    { id: 'user-keeper', email: 'keeper@vomamxenang.local', password: await bcrypt.hash('keeper123', 10), role: Role.STOREKEEPER },
    { id: 'user-customer', email: 'customer@vomamxenang.local', password: await bcrypt.hash('customer123', 10), role: Role.STOREKEEPER },
  ];
  for (const user of users) {
    const { id: _id, ...data } = user;
    await prisma.user.upsert({ where: { email: user.email }, update: data, create: user });
  }

  const clients = [
    { id: 'client-guest', name: 'Guest', email: 'guest@vomamxenang.local', phone: '', company: 'Guest', type: 'RETAIL', notes: 'Guest checkout account' },
    { id: 'client-logistics', name: 'Công ty Võ Mạnh Logistics', email: 'info@vomamxenang.local', phone: '0905123456', company: 'Võ Mạnh Logistics', type: 'B2B_TIER1', notes: 'Khách hàng doanh nghiệp thân thiết' },
    { id: 'client-thanhdat', name: 'Công ty Thành Đạt', email: 'contact@thanhdat.com', phone: '0987654321', company: 'Thành Đạt Co., Ltd.', type: 'B2B_TIER2', notes: 'Ưu tiên giao hàng trong tuần' },
  ];
  for (const client of clients) {
    const { id: _id, ...data } = client;
    await prisma.client.upsert({ where: { email: client.email }, update: data, create: client });
  }
  const suppliers = [
    { id: 'supplier-casumina', name: 'Casumina Miền Nam', email: 'sales@casumina.example', phone: '02838290000', company: 'Casumina', address: 'TP. Hồ Chí Minh', notes: 'Nguồn lốp đặc' },
    { id: 'supplier-oem', name: 'OEM Forklift Parts', email: 'sales@oem.example', phone: '0909000111', company: 'OEM Parts', address: 'Bình Dương', notes: 'Mâm xe và phụ tùng' },
  ];
  for (const supplier of suppliers) {
    const { id: _id, ...data } = supplier;
    try {
      await prisma.supplier.upsert({ where: { email: supplier.email }, update: data, create: supplier, select: { id: true } });
    } catch (error: unknown) {
      // Older local databases did not yet have Supplier.company. Seed the
      // compatible fields so developers can migrate/seed incrementally.
      const isMissingColumn = typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2022';
      if (!isMissingColumn) throw error;
      const { company: _company, ...legacyData } = data;
      const { company: _createCompany, ...legacyCreate } = supplier;
      console.warn('Supplier.company is absent in this database; seeding supplier without company. Run yarn prisma:migrate:local afterwards.');
      await prisma.supplier.upsert({ where: { email: supplier.email }, update: legacyData, create: legacyCreate, select: { id: true } });
    }
  }

  // Nội dung mặc định được lấy từ footer frontend; có thể quản trị tại /admin/store-info.
  const storeInfo = {
    id: 'store-vomamxenang',
    name: 'Võ Mâm Xe Nâng',
    address: 'TP. Hồ Chí Minh, Việt Nam',
    phone: '0905 123 456',
    email: 'info@vomamxenang.com',
    website: 'https://vomamxenang.com',
    facebookUrl: 'https://www.facebook.com/',
    businessHours: 'Liên hệ để được tư vấn và báo giá.',
    notes: 'Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao từ các nhà sản xuất hàng đầu. Theo dõi: Facebook | Instagram | YouTube. © 2026 Võ Mâm Xe Nâng. All rights reserved.',
    isActive: true,
  };
  await prisma.storeInfo.upsert({ where: { id: storeInfo.id }, update: storeInfo, create: storeInfo });

  const aboutPage = {
    id: 'about-vomamxenang',
    title: 'Về Võ Mâm Xe Nâng',
    summary: 'Chúng tôi cung cấp lốp, mâm và dịch vụ bảo dưỡng xe nâng, giúp doanh nghiệp vận hành an toàn, bền bỉ và hiệu quả.',
    content: 'Võ Mâm Xe Nâng chuyên cung cấp lốp đặc, lốp hơi, mâm xe và phụ tùng xe nâng cho kho bãi, nhà máy và đơn vị logistics.\n\nChúng tôi tư vấn giải pháp phù hợp theo tải trọng, điều kiện mặt bằng và tần suất vận hành, đồng thời hỗ trợ bảo dưỡng để thiết bị luôn hoạt động ổn định.\n\nVới sản phẩm được chọn lọc và đội ngũ tận tâm, chúng tôi hướng đến quan hệ hợp tác lâu dài cùng khách hàng.',
    imageUrl: null,
    isPublished: true,
  };
  await prisma.aboutPage.upsert({ where: { id: aboutPage.id }, update: aboutPage, create: aboutPage });

  const categories = [
    { id: 'category-tires', name: 'Vỏ xe nâng', tireSize: 'Nhiều kích thước', brand: 'Nhiều thương hiệu', tireType: TireType.SOLID, rimType: RimType.STANDARD, origin: 'Nhiều nguồn', condition: TireCondition.NEW, specifications: 'Danh mục vỏ/lốp xe nâng' },
    { id: 'category-rims', name: 'Mâm xe nâng', tireSize: 'Nhiều kích thước', brand: 'OEM', tireType: TireType.SOLID, rimType: RimType.STANDARD, origin: 'Nhiều nguồn', condition: TireCondition.NEW, specifications: 'Danh mục mâm xe nâng' },
  ];
  for (const category of categories) await prisma.category.upsert({ where: { id: category.id }, update: category, create: category });

  const demoProductIds = ['product-1', 'product-2', 'product-3'];
  await prisma.$transaction(async (transaction) => {
    const relatedProducts = { productId: { in: demoProductIds } };
    await transaction.productComment.deleteMany({ where: relatedProducts });
    await transaction.favouriteProduct.deleteMany({ where: relatedProducts });
    await transaction.priceMatrix.deleteMany({ where: relatedProducts });
    await transaction.stockLocation.deleteMany({ where: relatedProducts });
    await transaction.transactionDetail.deleteMany({ where: relatedProducts });
    await transaction.assemblyLog.deleteMany({ where: relatedProducts });
    await transaction.orderItem.deleteMany({ where: relatedProducts });
    await transaction.product.deleteMany({ where: { id: { in: demoProductIds } } });
  });

  assertForkliftTireSeedQuality(forkliftTireProducts);
  for (const product of forkliftTireProducts) {
    const { id: _id, ...data } = product;
    await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: product });
  }
  const rimProducts = [
    { id:'product-rim-600-9-click', sku:'SEED-RIM-600-9-CLICK', name:'Mâm xe nâng 6.00-9 kiểu CLICK', slug:'mam-xe-nang-6-00-9-click', type:'RIM' as const, categoryId:'category-rims', size:'6.00-9', brand:'OEM', tireType:null, rimType:'CLICK', condition:'NEW_100', importPrice:1250000, sellingPrice:1580000, minStock:3, maxStock:20, status:'PUBLISHED' as const },
    { id:'product-rim-650-10-standard', sku:'SEED-RIM-650-10-STANDARD', name:'Mâm xe nâng 6.50-10 Standard', slug:'mam-xe-nang-6-50-10-standard', type:'RIM' as const, categoryId:'category-rims', size:'6.50-10', brand:'OEM', tireType:null, rimType:'STANDARD', condition:'NEW_100', importPrice:1450000, sellingPrice:1850000, minStock:3, maxStock:20, status:'PUBLISHED' as const },
    { id:'product-rim-700-12-lip', sku:'SEED-RIM-700-12-LIP', name:'Mâm xe nâng 7.00-12 kiểu LIP', slug:'mam-xe-nang-7-00-12-lip', type:'RIM' as const, categoryId:'category-rims', size:'7.00-12', brand:'TOYOTA OEM', tireType:null, rimType:'LIP', condition:'NEW_100', importPrice:1750000, sellingPrice:2280000, minStock:2, maxStock:15, status:'PUBLISHED' as const },
    { id:'product-rim-500-8-used', sku:'SEED-RIM-500-8-USED', name:'Mâm xe nâng 5.00-8 đã qua sử dụng', slug:'mam-xe-nang-5-00-8-da-qua-su-dung', type:'RIM' as const, categoryId:'category-rims', size:'5.00-8', brand:'OEM', tireType:null, rimType:'STANDARD', condition:'USED', importPrice:650000, sellingPrice:950000, minStock:2, maxStock:12, status:'PUBLISHED' as const },
  ];
  for (const product of rimProducts) {
    const { id: _id, ...data } = product;
    await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: product });
  }

  const rims = [
    { id: 'rim-1', sku: 'RIM-600-9-6H', size: '6.00-9', boltHoles: 6, compatibleModels: 'Toyota, Komatsu', brand: 'OEM', importPrice: 850000, sellingPrice: 980000 },
    { id: 'rim-2', sku: 'RIM-700-12-8H', size: '7.00-12', boltHoles: 8, compatibleModels: 'Mitsubishi, TCM', brand: 'OEM', importPrice: 1120000, sellingPrice: 1280000 },
  ];
  for (const rim of rims) await prisma.wheelRim.upsert({ where: { id: rim.id }, update: rim, create: rim });

  const warehouse = await prisma.warehouse.upsert({ where: { code: 'KHO-TT' }, update: { name: 'Kho Trung Tâm', address: '123 Đường Thành Công, TP.HCM' }, create: { id: 'warehouse-main', code: 'KHO-TT', name: 'Kho Trung Tâm', address: '123 Đường Thành Công, TP.HCM' } });
  const locations = [
    { id: 'location-a1', warehouseId: warehouse.id, zone: 'A', rack: '01', slot: '01', locationCode: 'KTT-A-01-01', capacity: 100 },
    { id: 'location-a2', warehouseId: warehouse.id, zone: 'A', rack: '01', slot: '02', locationCode: 'KTT-A-01-02', capacity: 80 },
    { id: 'location-b1', warehouseId: warehouse.id, zone: 'B', rack: '02', slot: '01', locationCode: 'KTT-B-02-01', capacity: 60 },
  ];
  for (const location of locations) await prisma.location.upsert({ where: { locationCode: location.locationCode }, update: location, create: location });
  const stocks = [
    { id: 'stock-rim-1', locationId: 'location-a2', wheelRimId: 'rim-1', quantity: 18 }, { id: 'stock-rim-2', locationId: 'location-b1', wheelRimId: 'rim-2', quantity: 6 },
  ];
  for (const stock of stocks) await prisma.stockLocation.upsert({ where: { id: stock.id }, update: stock, create: stock });
  for (const [categoryId, locationId, quantity] of [['category-tires','location-a2',4],['category-rims','location-a1',28]] as const) await prisma.stock.upsert({ where: { id: `legacy-${categoryId}` }, update: { categoryId, locationId, quantity }, create: { id: `legacy-${categoryId}`, categoryId, locationId, quantity } });
  const posts = [{ id: 'post-1', title: 'Cách chọn lốp xe nâng phù hợp với môi trường làm việc', content: 'Lốp đặc phù hợp kho hàng và tải nặng; lốp hơi phù hợp mặt bằng ngoài trời. Hãy chọn đúng kích thước, tải trọng và loại mâm để vận hành an toàn.', videoUrl: null }, { id: 'post-2', title: 'Quy trình tái chế vỏ xe nâng an toàn và hiệu quả', content: 'Vỏ xe nâng đã qua sử dụng được phân loại, làm sạch và tái chế theo quy trình giảm tác động môi trường. Việc thay lốp đúng lúc giúp xe vận hành ổn định.', videoUrl: null }, { id: 'post-3', title: 'Bảo dưỡng mâm xe nâng: 5 việc cần kiểm tra', content: 'Kiểm tra bu-lông, độ đồng tâm, vết nứt và tình trạng bề mặt mâm định kỳ để giảm rủi ro trong vận hành.', videoUrl: null }];
  for (const post of posts) await prisma.post.upsert({ where: { id: post.id }, update: post, create: post });
  await prisma.postComment.upsert({ where: { id: 'post-comment-1' }, update: { content: 'Bài viết rất hữu ích cho đội vận hành.' }, create: { id: 'post-comment-1', postId: 'post-1', userId: 'user-customer', content: 'Bài viết rất hữu ích cho đội vận hành.' } });
  console.log(`Seed complete: removed 3 demo products and added or updated ${forkliftTireProducts.length} published forklift-tire catalog products.`);
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
