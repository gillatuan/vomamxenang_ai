import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({ where: { email: 'admin@vomamxenang.local' }, update: { password }, create: { email: 'admin@vomamxenang.local', password, role: 'ADMIN' } });
  console.log('Seeded admin user');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
