import { PrismaClient, ProductType, OrderStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@vomamxenang.local' },
    update: { password },
    create: {
      email: 'admin@vomamxenang.local',
      password,
      role: Role.ADMIN_MANAGER,
    },
  });

  await prisma.client.upsert({
    where: { email: 'guest@vomamxenang.local' },
    update: { name: 'Guest' },
    create: {
      name: 'Guest',
      email: 'guest@vomamxenang.local',
      phone: '',
      company: 'Guest',
      type: 'RETAIL',
      notes: 'Guest checkout account',
    },
  });

  const clients = [
    {
      id: 'client-1',
      name: 'Võ Mâm Xe Nâng',
      email: 'info@vomamxenang.local',
      phone: '0905123456',
      company: 'Võ Mạnh Logistics',
      type: 'WHOLESALE_L1',
      notes: 'Khách hàng thân thiết, mua nhiều phụ tùng',
    },
    {
      id: 'client-2',
      name: 'Công ty Thành Đạt',
      email: 'contact@thanhdat.com',
      phone: '0987654321',
      company: 'Thành Đạt Co., Ltd.',
      type: 'WHOLESALE_L2',
      notes: 'Yêu cầu giao hàng gấp trong tuần',
    },
  ];

  await Promise.all(
    clients.map((client) =>
      prisma.client.upsert({
        where: { id: client.id },
        update: client,
        create: client,
      }),
    ),
  );

  const products = [
    {
      id: 'product-1',
      sku: 'SKU:TIRE-700-12',
      type: ProductType.TIRE,
      name: 'Lốp xe nâng 7.00-12',
      size: '7.00-12',
      brand: 'Bridgestone',
      tireType: 'PNEUMATIC',
      rimType: 'LIP',
      condition: 'NEW',
      importPrice: 420000,
      sellingPrice: 520000,
      minStock: 5,
      maxStock: 50,
      imageUrl: 'https://example.com/images/tire-700-12.jpg',
      description: 'Lốp xe nâng chính hãng, độ bền cao, phù hợp mọi địa hình.',
    },
    {
      id: 'product-2',
      sku: 'SKU:TIRE-600-9',
      type: ProductType.TIRE,
      name: 'Lốp xe nâng 6.00-9',
      size: '6.00-9',
      brand: 'Nexen',
      tireType: 'SOLID',
      rimType: 'CLICK',
      condition: 'NEW',
      importPrice: 380000,
      sellingPrice: 450000,
      minStock: 3,
      maxStock: 40,
      imageUrl: 'https://example.com/images/tire-600-9.jpg',
      description: 'Lốp đặc chịu tải cao cho kho lạnh và nền gồ ghề.',
    },
  ];

  const wheelRims = [
    {
      id: 'rim-1',
      sku: 'SKU:RIM-650-10',
      size: '6.50-10',
      boltHoles: 5,
      compatibleModels: 'Toyota, Komatsu',
      brand: 'OEM',
      importPrice: 850000,
      sellingPrice: 980000,
    },
  ];

  await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      }),
    ),
  );

  await Promise.all(
    wheelRims.map((rim) =>
      prisma.wheelRim.upsert({
        where: { id: rim.id },
        update: rim,
        create: rim,
      }),
    ),
  );

  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'warehouse-1' },
    update: { name: 'Kho Trung Tâm', address: '123 Đường Thành Công' },
    create: {
      id: 'warehouse-1',
      name: 'Kho Trung Tâm',
      address: '123 Đường Thành Công',
      code: 'WH-001',
      locations: {
        create: [
          {
            id: 'location-1',
            zone: 'A',
            rack: '01',
            slot: '01',
            locationCode: 'K1-A-01-01',
            capacity: 100,
          },
        ],
      },
    },
  });

  const location = await prisma.location.upsert({
    where: { id: 'location-1' },
    update: {
      warehouseId: warehouse.id,
      zone: 'A',
      rack: '01',
      slot: '01',
      locationCode: 'K1-A-01-01',
      capacity: 100,
    },
    create: {
      id: 'location-1',
      warehouseId: warehouse.id,
      zone: 'A',
      rack: '01',
      slot: '01',
      locationCode: 'K1-A-01-01',
      capacity: 100,
    },
  });

  await prisma.stockLocation.upsert({
    where: { id: 'stock-1' },
    update: {
      locationId: location.id,
      productId: 'product-1',
      quantity: 20,
    },
    create: {
      id: 'stock-1',
      locationId: location.id,
      productId: 'product-1',
      quantity: 20,
    },
  });

  await prisma.stockLocation.upsert({
    where: { id: 'stock-2' },
    update: {
      locationId: location.id,
      wheelRimId: 'rim-1',
      quantity: 10,
    },
    create: {
      id: 'stock-2',
      locationId: location.id,
      wheelRimId: 'rim-1',
      quantity: 10,
    },
  });

  await prisma.priceMatrix.upsert({
    where: { id: 'price-1' },
    update: { price: 520000 },
    create: {
      id: 'price-1',
      productId: 'product-1',
      customerType: 'RETAIL',
      price: 520000,
    },
  });

  await prisma.priceMatrix.upsert({
    where: { id: 'price-2' },
    update: { price: 500000 },
    create: {
      id: 'price-2',
      productId: 'product-1',
      customerType: 'WHOLESALE_L1',
      price: 500000,
    },
  });

  await prisma.order.upsert({
    where: { id: 'order-1' },
    update: {
      totalAmount: 520000,
      status: OrderStatus.PAID,
      stripeSessionId: 'sess_1234567890',
    },
    create: {
      id: 'order-1',
      client: { connect: { email: 'info@vomamxenang.local' } },
      totalAmount: 520000,
      status: OrderStatus.PAID,
      stripeSessionId: 'sess_1234567890',
      details: {
        create: [
          {
            productId: 'product-1',
            locationId: location.id,
            quantity: 1,
            price: 520000,
          },
        ],
      },
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-1' },
    update: {
      title: 'Giới thiệu dịch vụ bảo dưỡng xe nâng',
      content: 'Dịch vụ bảo dưỡng định kỳ giúp xe hoạt động ổn định và tăng tuổi thọ. Chúng tôi cung cấp gói bảo dưỡng trọn gói cho mọi loại xe nâng.',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      createdAt: new Date(),
    },
    create: {
      id: 'post-1',
      title: 'Giới thiệu dịch vụ bảo dưỡng xe nâng',
      content: 'Dịch vụ bảo dưỡng định kỳ giúp xe hoạt động ổn định và tăng tuổi thọ. Chúng tôi cung cấp gói bảo dưỡng trọn gói cho mọi loại xe nâng.',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
    },
  });

  await prisma.post.upsert({
    where: { id: 'post-2' },
    update: {
      title: 'Mẹo chọn lốp xe nâng phù hợp',
      content: 'Chọn đúng loại lốp giúp giảm chi phí vận hành và tăng an toàn. Tìm hiểu các loại lốp phù hợp với khối lượng và điều kiện làm việc.',
      videoUrl: null,
      createdAt: new Date(),
    },
    create: {
      id: 'post-2',
      title: 'Mẹo chọn lốp xe nâng phù hợp',
      content: 'Chọn đúng loại lốp giúp giảm chi phí vận hành và tăng an toàn. Tìm hiểu các loại lốp phù hợp với khối lượng và điều kiện làm việc.',
      videoUrl: null,
    },
  });

  console.log('Seeded admin user, clients, products, wheel rims, warehouse, stock, price matrix, orders, and posts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
