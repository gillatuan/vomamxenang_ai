const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const { topicProducts, topicMetadata } = require('../src/lib/seo/category-seo.ts');
const { hasFilters } = require('../src/lib/seo/keyword-utils.ts');
const { productSeoDefaults } = require('../src/lib/seo/product-seo.ts');
const { rimPath, rimTitle } = require('../src/lib/seo/rim-seo.ts');
const { contentBreadcrumbs, contentJsonLd, seoValues } = require('../src/lib/public-seo.ts');
const tire = { id: 't', slug: 'lop-thuc', type: 'TIRE', tireType: 'SOLID', name: 'Lốp NEXEN 6.00-9', brand: 'NEXEN', size: '6.00-9', sellingPrice: 1230000 };
test('topic inventory excludes drafts, noindex and unrelated product types', () => {
  const rows = [tire, { ...tire, id: 'draft', status: 'DRAFT' }, { ...tire, id: 'private', seo: { robots: 'noindex,follow' } }, { id: 'service', type: 'SERVICE' }];
  assert.deepEqual(topicProducts('lop-dac-xe-nang', rows).map(p => p.id), ['t']);
  assert.deepEqual(topicProducts('mam-xe-nang', rows), []);
  assert.equal(topicMetadata('mam-xe-nang', true).robots.index, false);
});
test('filter pages noindex with clean category canonical, tracking alone stays indexable', () => {
  for (const key of ['brand','size','type','page','sort','condition','q','search']) assert.equal(hasFilters({ [key]: 'x' }), true);
  assert.equal(hasFilters({ utm_source: 'newsletter' }), false);
  const metadata = topicMetadata('vo-xe-nang', hasFilters({ size: '6.00-9' }));
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, true);
  assert.match(metadata.alternates.canonical, /\/vo-xe-nang$/);
});
test('metadata uses real facts without duplicate attributes and preserves editorial override', () => {
  assert.equal(productSeoDefaults(tire).title, tire.name);
  const manual = seoValues({ ...tire, seo: { title: 'Tiêu đề riêng', description: 'Mô tả riêng' } }, '/products/lop-thuc');
  assert.equal(manual.title, 'Tiêu đề riêng'); assert.equal(manual.description, 'Mô tả riêng');
  assert.doesNotMatch(productSeoDefaults({ type: 'RIM', brand: 'OEM', size: '6.50-10' }).secondaryKeywords.join(' '), /vỏ/);
});
test('schema breadcrumbs match visible crumb data and prices never imply stock', () => {
  const [entity, breadcrumbs] = JSON.parse(contentJsonLd(tire, 'products'));
  assert.equal(entity.offers.price, tire.sellingPrice);
  assert.equal(entity.offers.availability, undefined);
  assert.equal(entity.aggregateRating, undefined);
  assert.deepEqual(breadcrumbs.itemListElement.map(i => i.name), contentBreadcrumbs(tire, 'products').map(i => i.name));
  assert.equal(JSON.parse(contentJsonLd({ ...tire, sellingPrice: 0 }, 'products'))[0].offers, undefined);
});
test('rim routes remain stable when editable size changes', () => {
  const rim = { id: 'rim-1', size: '6.50-10', boltHoles: 5, brand: 'OEM' };
  assert.equal(rimPath(rim), rimPath({ ...rim, size: '7.00-12' }));
  assert.match(rimTitle(rim), /6.50-10 5 lỗ/);
  assert.doesNotMatch(rimTitle(rim), /Toyota/);
});
