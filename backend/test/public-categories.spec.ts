import 'reflect-metadata';
import assert from 'node:assert/strict';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { CategoryController } from '../src/category/category.controller';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CategoryService } from '../src/category/category.service';
async function main() {
  const service = { findPublic: async () => [{ id: 'tires', name: 'Vỏ xe nâng', stock: 999, importPrice: 100 }] };
  const controller = new CategoryController(service as unknown as CategoryService);
  assert.deepEqual(await controller.publicList(), [{ id: 'tires', name: 'Vỏ xe nâng' }]);
  assert.equal(Reflect.getMetadata(PATH_METADATA, controller.publicList), 'public');
  assert.equal(Reflect.getMetadata(GUARDS_METADATA, controller.publicList), undefined);
  for (const handler of [controller.findAll, controller.findOne, controller.search, controller.getTotalStock, controller.create, controller.update, controller.remove]) {
    assert.ok(Reflect.getMetadata(GUARDS_METADATA, handler)?.length, 'Operational category endpoints remain protected');
  }
  let categoryQuery: unknown;
  const prisma = { category: { findMany: async (query: unknown): Promise<Array<{ id: string; name: string }>> => { categoryQuery = query; return []; } } };
  const categoryService = new CategoryService(prisma as unknown as PrismaService);
  assert.deepEqual(await categoryService.findPublic(), [{ id: 'category-tires', name: 'Vỏ xe nâng' }, { id: 'category-rims', name: 'Mâm xe nâng' }]);
  assert.deepEqual(categoryQuery, { select: { id: true, name: true }, orderBy: { name: 'asc' } });
  prisma.category.findMany = async (query: unknown) => { categoryQuery = query; return [{ id: 'custom', name: 'Custom' }]; };
  assert.deepEqual(await categoryService.findPublic(), [{ id: 'custom', name: 'Custom' }]);
  let productWhere: Record<string, unknown> = {};
  const productPrisma = {
    product: { findMany: async (query: { where: Record<string, unknown> }) => { productWhere = query.where; return []; } },
  };
  const products = new ProductsService(productPrisma as unknown as PrismaService);
  for (const [categoryId, type] of [['category-tires', 'TIRE'], ['category-rims', 'RIM']]) {
    await products.findAll({ categoryId, q: '600', brand: 'NEXEN', minPrice: 10 });
    assert.deepEqual(productWhere.AND, [{ OR: [{ categoryId }, { categoryId: null, type }] }]);
    assert.equal(productWhere.categoryId, undefined);
    assert.equal(productWhere.status, 'PUBLISHED');
    assert.equal(productWhere.brand, 'NEXEN');
    assert.ok(productWhere.OR);
    assert.deepEqual(productWhere.sellingPrice, { gte: 10 });
  }
  await products.findAll({ categoryId: 'custom' });
  assert.equal(productWhere.categoryId, 'custom');
  console.log('Public categories, empty-DB fallback, product filters and private guards PASS');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
