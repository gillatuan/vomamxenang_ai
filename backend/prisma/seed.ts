import { PrismaClient } from '@prisma/client';
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
      role: 'ADMIN',
    },
  });

  const clients = [
    {
      id: 'client-1',
      name: 'Võ Mạnh Xe Nâng',
      email: 'info@vomamxenang.local',
      phone: '0905123456',
      company: 'Võ Mạnh Logistics',
      notes: 'Khách hàng thân thiết, mua nhiều phụ tùng',
    },
    {
      id: 'client-2',
      name: 'Công ty Thành Đạt',
      email: 'contact@thanhdat.com',
      phone: '0987654321',
      company: 'Thành Đạt Co., Ltd.',
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
      type: 'TIRE',
      name: 'Lốp xe nâng 7.00-12',
      importPrice: '420000',
      sellingPrice: '520000',
      quantityInStock: 35,
      imageUrl: 'https://example.com/images/tire-700-12.jpg',
      description: 'Lốp xe nâng chính hãng, độ bền cao, phù hợp mọi địa hình.',
    },
    {
      id: 'product-2',
      type: 'RIM',
      name: 'Vành xe nâng 6.50-10',
      importPrice: '850000',
      sellingPrice: '980000',
      quantityInStock: 18,
      imageUrl: 'https://example.com/images/rim-650-10.jpg',
      description: 'Vành thép chịu lực cho xe nâng hạng nhẹ và trung bình.',
    },
    {
      id: 'product-3',
      type: 'SERVICE',
      name: 'Bảo dưỡng xe nâng',
      importPrice: '200000',
      sellingPrice: '350000',
      quantityInStock: 999,
      imageUrl: 'https://example.com/images/service-maintenance.jpg',
      description: 'Gói bảo dưỡng định kỳ giúp kéo dài tuổi thọ xe nâng.',
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

  const orders = [
    {
      id: 'order-1',
      clientEmail: 'info@vomamxenang.local',
      totalAmount: '1560000',
      status: 'PAID',
      stripeSessionId: 'sess_1234567890',
    },
    {
      id: 'order-2',
      clientEmail: 'contact@thanhdat.com',
      totalAmount: '1330000',
      status: 'PENDING',
      stripeSessionId: 'sess_0987654321',
    },
  ];

  await Promise.all(
    orders.map((order) =>
      prisma.order.upsert({
        where: { id: order.id },
        update: {
          totalAmount: order.totalAmount,
          status: order.status,
          stripeSessionId: order.stripeSessionId,
        },
        create: {
          id: order.id,
          client: {
            connect: { email: order.clientEmail },
          },
          totalAmount: order.totalAmount,
          status: order.status,
          stripeSessionId: order.stripeSessionId,
        },
      }),
    ),
  );

  const posts = [
    {
      id: 'post-1',
      title: 'Giới thiệu dịch vụ bảo dưỡng xe nâng',
      content: 'Dịch vụ bảo dưỡng định kỳ giúp xe hoạt động ổn định và tăng tuổi thọ. Chúng tôi cung cấp gói bảo dưỡng trọn gói cho mọi loại xe nâng.',
      videoUrl: 'https://www.youtube.com/watch?v=example1',
      published: true,
    },
    {
      id: 'post-2',
      title: 'Mẹo chọn lốp xe nâng phù hợp',
      content: 'Chọn đúng loại lốp giúp giảm chi phí vận hành và tăng an toàn. Tìm hiểu các loại lốp phù hợp với khối lượng và điều kiện làm việc.',
      videoUrl: null,
      published: false,
    },
  ];

  await Promise.all(
    posts.map((post) =>
      prisma.post.upsert({
        where: { id: post.id },
        update: post,
        create: post,
      }),
    ),
  );

  console.log('Seeded admin user, clients, products, orders, and posts');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
