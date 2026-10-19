import assert from 'node:assert/strict';
import { canonicalSize, suggestDemoPrice } from '../scripts/demo-product-prices';

const base = {
  id: 'test-1', sku: 'DEMO-1', type: 'TIRE', name: 'Test vỏ xe nâng',
  brand: 'Casumina', size: '6.00-9', tireType: 'SOLID', condition: 'NEW_100',
  sellingPrice: null,
};

assert.equal(suggestDemoPrice(base)?.amount, 2100000, 'Solid sample price');
assert.equal(suggestDemoPrice({ ...base, brand: 'NEXEN' })?.amount, 3200000, 'Nexen sample price');
assert.equal(suggestDemoPrice({ ...base, tireType: 'PNEUMATIC' })?.amount, 2250000, 'Pneumatic sample price');
assert.equal(suggestDemoPrice({ ...base, condition: 'USED' })?.amount, 1300000, 'Used sample price');
assert.equal(suggestDemoPrice({ ...base, sellingPrice: 1500000 }), null, 'Never replace existing price');
assert.equal(suggestDemoPrice({ ...base, type: 'RIM' }), null, 'Never guess a rim price');
assert.equal(suggestDemoPrice({ ...base, tireType: 'NON_MARKING' }), null, 'Never guess non-marking price');
assert.equal(suggestDemoPrice({ ...base, size: 'unknown' }), null, 'Unknown sizes stay unpriced');
assert.equal(canonicalSize(' 18×7-8 '), '18X7-8');
console.log('Demo product pricing guards passed.');
