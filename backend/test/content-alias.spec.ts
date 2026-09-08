import 'reflect-metadata';
import { strict as assert } from 'assert';
import { PrismaService } from '../src/prisma/prisma.service';
import { saveContent, slugify } from '../src/content/content-alias';
import { ProductsService } from '../src/products/products.service';
import { PostsService } from '../src/posts/posts.service';
import { config } from 'dotenv';
config({ path: '.env.local' });
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL!).hostname)) throw new Error('Local database required');
const prisma = new PrismaService();
const ids: { kind: 'product' | 'post'; id: string }[] = [];
async function run() {
  assert.equal(slugify('Lốp đặc Đà Nẵng 6.00-9'), 'lop-dac-da-nang-6-00-9');
  const unique = `kiểm thử alias ${Date.now()}`;
  for (const kind of ['product', 'post'] as const) {
    const data = kind === 'product' ? { name: unique, sku: `seo-test-${Date.now()}`, importPrice: 0, status: 'PUBLISHED' } : { title: unique, content: 'Nội dung thử nghiệm', status: 'PUBLISHED' };
    const first = await saveContent(prisma, kind, data); ids.push({ kind, id: first.id });
    const secondData = kind === 'product' ? { ...data, sku: `${data.sku}-2` } : data;
    const second = await saveContent(prisma, kind, secondData); ids.push({ kind, id: second.id });
    assert.equal(second.slug, `${first.slug}-2`);
    const changed = await saveContent(prisma, kind, { slug: `${first.slug}-moi` }, first.id);
    assert.ok(changed.aliases.includes(first.slug));
    const service = kind === 'product' ? new ProductsService(prisma) : new PostsService(prisma);
    assert.equal((await service.findOne(first.slug))?.id, first.id);
    assert.equal((await service.findOne(changed.slug))?.id, first.id);
    assert.equal((await service.findOne(first.id))?.slug, changed.slug);
    await assert.rejects(saveContent(prisma, kind, { slug: first.slug }, second.id), /Alias đã được sử dụng/);
    const renamed = await saveContent(prisma, kind, kind === 'product' ? { name: 'Tên mới' } : { title: 'Tiêu đề mới' }, first.id);
    assert.equal(renamed.slug, changed.slug);
    await saveContent(prisma, kind, { status: 'DRAFT' }, first.id);
    assert.equal(await service.findOne(first.slug), null);
    assert.equal(await service.findOne(first.id), null);
  }
  console.log('Passed alias integration: Vietnamese, collision, history, ID resolution, rename stability, draft privacy.');
}
run().finally(async () => {
  for (const { kind, id } of ids) await (prisma[kind] as any).delete({ where: { id } });
  await prisma.$disconnect();
}).catch(error => { console.error(error); process.exitCode = 1; });
