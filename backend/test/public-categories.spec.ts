import 'reflect-metadata';
import assert from 'node:assert/strict';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { CategoryController } from '../src/category/category.controller';
import { CategoryService } from '../src/category/category.service';
async function main() {
  const service = { findAll: async () => [{ id: 'tires', name: 'Vỏ xe nâng', stock: 999, importPrice: 100 }] };
  const controller = new CategoryController(service as unknown as CategoryService);
  assert.deepEqual(await controller.publicList(), [{ id: 'tires', name: 'Vỏ xe nâng' }]);
  assert.equal(Reflect.getMetadata(PATH_METADATA, controller.publicList), 'public');
  assert.equal(Reflect.getMetadata(GUARDS_METADATA, controller.publicList), undefined);
  for (const handler of [controller.findAll, controller.findOne, controller.search, controller.getTotalStock, controller.create, controller.update, controller.remove]) {
    assert.ok(Reflect.getMetadata(GUARDS_METADATA, handler)?.length, 'Operational category endpoints remain protected');
  }
  console.log('Public category access and private endpoint guards PASS');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
