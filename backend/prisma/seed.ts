import { config } from 'dotenv';
import { PrismaClient, ProductType, Role, TireCondition, TireType, RimType, OrderStatus, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
    await prisma.supplier.upsert({ where: { email: supplier.email }, update: data, create: supplier });
  }

  const categories = [
    { id: 'category-solid-6009', name: 'Lốp đặc 6.00-9', tireSize: '6.00-9', brand: 'Casumina', tireType: TireType.SOLID, rimType: RimType.CLICK, origin: 'Việt Nam', condition: TireCondition.NEW, specifications: 'Lốp đặc chịu tải 2.5 tấn' },
    { id: 'category-pneumatic-70012', name: 'Lốp hơi 7.00-12', tireSize: '7.00-12', brand: 'Bridgestone', tireType: TireType.PNEUMATIC, rimType: RimType.LIP, origin: 'Thái Lan', condition: TireCondition.NEW, specifications: 'Lốp hơi cho xe nâng địa hình' },
  ];
  for (const category of categories) await prisma.category.upsert({ where: { id: category.id }, update: category, create: category });

  const products = [
    { id: 'product-1', sku: 'TIRE-700-12-BRIDGESTONE', type: ProductType.TIRE, name: 'Lốp hơi Bridgestone 7.00-12', size: '7.00-12', brand: 'Bridgestone', tireType: 'PNEUMATIC', rimType: 'LIP', condition: 'NEW_100', importPrice: 420000, sellingPrice: 520000, minStock: 8, maxStock: 60, imageUrl: null, description: 'Lốp hơi bền bỉ cho xe nâng làm việc ngoài trời.' },
    { id: 'product-2', sku: 'TIRE-600-9-CASUMINA', type: ProductType.TIRE, name: 'Lốp đặc Casumina 6.00-9', size: '6.00-9', brand: 'Casumina', tireType: 'SOLID', rimType: 'CLICK', condition: 'NEW_100', importPrice: 380000, sellingPrice: 475000, minStock: 6, maxStock: 50, imageUrl: null, description: 'Lốp đặc chịu tải cao, phù hợp kho hàng.' },
    { id: 'product-3', sku: 'TIRE-500-8-NONMARK', type: ProductType.TIRE, name: 'Lốp đặc trắng 5.00-8', size: '5.00-8', brand: 'Solideal', tireType: 'NON_MARKING', rimType: 'STANDARD', condition: 'NEW_100', importPrice: 610000, sellingPrice: 735000, minStock: 5, maxStock: 30, imageUrl: null, description: 'Lốp không để lại vệt cho kho lạnh và nền sạch.' },
  ];
  for (const product of products) await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
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
    { id: 'stock-product-1', locationId: 'location-a1', productId: 'product-1', quantity: 28 }, { id: 'stock-product-2', locationId: 'location-a2', productId: 'product-2', quantity: 4 }, { id: 'stock-product-3', locationId: 'location-b1', productId: 'product-3', quantity: 0 },
    { id: 'stock-rim-1', locationId: 'location-a2', wheelRimId: 'rim-1', quantity: 18 }, { id: 'stock-rim-2', locationId: 'location-b1', wheelRimId: 'rim-2', quantity: 6 },
  ];
  for (const stock of stocks) await prisma.stockLocation.upsert({ where: { id: stock.id }, update: stock, create: stock });
  for (const [categoryId, locationId, quantity] of [['category-solid-6009','location-a2',4],['category-pneumatic-70012','location-a1',28]] as const) await prisma.stock.upsert({ where: { id: `legacy-${categoryId}` }, update: { categoryId, locationId, quantity }, create: { id: `legacy-${categoryId}`, categoryId, locationId, quantity } });
  for (const product of products) for (const [customerType, ratio] of [['RETAIL',1],['B2B_TIER1',.94],['B2B_TIER2',.89]] as const) await prisma.priceMatrix.upsert({ where: { productId_customerType: { productId: product.id, customerType } }, update: { price: Math.round((product.sellingPrice ?? 0) * ratio) }, create: { productId: product.id, customerType, price: Math.round((product.sellingPrice ?? 0) * ratio) } });

  const transactions = [{ id: 'tx-import-001', code: 'PNK-2026-001', type: TransactionType.IMPORT, partnerName: suppliers[0].name, userId: 'user-keeper', details: [{ productId: 'product-1', locationId: 'location-a1', quantity: 30, price: 420000 }, { productId: 'product-2', locationId: 'location-a2', quantity: 10, price: 380000 }] }, { id: 'tx-export-001', code: 'PXK-2026-001', type: TransactionType.EXPORT, partnerName: clients[1].name, userId: 'user-keeper', details: [{ productId: 'product-1', locationId: 'location-a1', quantity: 2, price: 520000 }] }];
  for (const tx of transactions) await prisma.inventoryTransaction.upsert({ where: { code: tx.code }, update: { partnerName: tx.partnerName }, create: { id: tx.id, code: tx.code, type: tx.type, partnerName: tx.partnerName, userId: tx.userId, details: { create: tx.details } } });
  await prisma.assemblyLog.upsert({ where: { id: 'assembly-001' }, update: { quantity: 3, pressingFee: 150000 }, create: { id: 'assembly-001', productId: 'product-2', wheelRimId: 'rim-1', quantity: 3, pressingFee: 150000, userId: 'user-keeper' } });
  await prisma.order.upsert({ where: { id: 'order-001' }, update: { totalAmount: 1040000, status: OrderStatus.PAID }, create: { id: 'order-001', code: 'DH-2026-001', clientId: 'client-logistics', totalAmount: 1040000, status: OrderStatus.PAID, items: { create: [{ productId: 'product-1', locationId: 'location-a1', quantity: 2, price: 520000 }] } } });
  await prisma.order.upsert({ where: { id: 'order-002' }, update: { totalAmount: 475000, status: OrderStatus.PENDING }, create: { id: 'order-002', code: 'DH-2026-002', clientId: 'client-thanhdat', totalAmount: 475000, status: OrderStatus.PENDING, items: { create: [{ productId: 'product-2', locationId: 'location-a2', quantity: 1, price: 475000 }] } } });
  const posts = [{ id: 'post-1', title: 'Cách chọn lốp xe nâng phù hợp với môi trường làm việc', content: 'Lốp đặc phù hợp kho hàng và tải nặng; lốp hơi phù hợp mặt bằng ngoài trời. Hãy chọn đúng kích thước, tải trọng và loại mâm để vận hành an toàn.', videoUrl: null }, { id: 'post-2', title: 'Quy trình tái chế vỏ xe nâng an toàn và hiệu quả', content: 'Vỏ xe nâng đã qua sử dụng được phân loại, làm sạch và tái chế theo quy trình giảm tác động môi trường. Việc thay lốp đúng lúc giúp xe vận hành ổn định.', videoUrl: null }, { id: 'post-3', title: 'Bảo dưỡng mâm xe nâng: 5 việc cần kiểm tra', content: 'Kiểm tra bu-lông, độ đồng tâm, vết nứt và tình trạng bề mặt mâm định kỳ để giảm rủi ro trong vận hành.', videoUrl: null }];
  for (const post of posts) await prisma.post.upsert({ where: { id: post.id }, update: post, create: post });
  await prisma.productComment.upsert({ where: { id: 'product-comment-1' }, update: { content: 'Lốp chạy êm và chịu tải tốt.', rating: 5 }, create: { id: 'product-comment-1', productId: 'product-1', userId: 'user-customer', content: 'Lốp chạy êm và chịu tải tốt.', rating: 5 } });
  await prisma.favouriteProduct.upsert({ where: { productId_userId: { productId: 'product-2', userId: 'user-customer' } }, update: {}, create: { productId: 'product-2', userId: 'user-customer' } });
  await prisma.postComment.upsert({ where: { id: 'post-comment-1' }, update: { content: 'Bài viết rất hữu ích cho đội vận hành.' }, create: { id: 'post-comment-1', postId: 'post-1', userId: 'user-customer', content: 'Bài viết rất hữu ích cho đội vận hành.' } });
  console.log('Seed complete: users, clients, suppliers, categories, products, rims, warehouses, stock, prices, transactions, orders, posts and interactions.');
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
