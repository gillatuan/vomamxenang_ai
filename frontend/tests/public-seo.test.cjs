const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const { contentJsonLd, contentMetadata } = require('../src/lib/public-seo.ts');
const { relatedContent } = require('../src/lib/content-seo.ts');
test('JSON-LD includes breadcrumbs, escapes injection and never invents commercial/review facts', () => {
  const item = { id: 'x', slug: 'real', name: 'Lốp <script>alert(1)</script>', sku: 'REAL', seo: { title: 'Một tiêu đề' } };
  const serialized = contentJsonLd(item, 'products');
  assert(!serialized.includes('<script>'));
  const data = JSON.parse(serialized);
  assert.equal(data[0].name, item.name);
  assert.equal(data[0]['@type'], 'Product');
  assert.equal(data[1]['@type'], 'BreadcrumbList');
  assert.equal(data[1].itemListElement[2].item, 'https://www.vomamxenang.com/products/real');
  for (const field of ['offers', 'aggregateRating', 'review', 'availability']) assert.equal(data[0][field], undefined);
  assert.deepEqual(contentMetadata(item, 'products').title, { absolute: 'Một tiêu đề' });
});
test('Related navigation is based on actual attributes and includes no unrelated items', () => {
  const current = { id: 'a', kind: 'products', size: '6.00-9', tags: ['lốp đặc'] };
  const relevant = { id: 'b', kind: 'products', size: '6.00-9' };
  const unrelated = { id: 'c', kind: 'products', size: '7.00-12' };
  assert.deepEqual(relatedContent(current, [current, relevant, unrelated]), [relevant]);
});

test('Product offer uses saved price and explicitly marks VAT excluded without inventing stock', () => {
  const item = { id: 'p', slug: 'phoenix-650-10', name: 'Vỏ đặc PHOENIX 6.50-10', sku: 'PHX-650',
    brand: 'PHOENIX', condition: 'NEW_100', sellingPrice: 3190000,
    tags: ['VAT_EXCLUDED_INVOICE_AVAILABLE'], imageUrl: 'https://example.com/verified-photo.jpg' };
  const [product] = JSON.parse(contentJsonLd(item, 'products'));
  assert.equal(product.offers.price, 3190000);
  assert.equal(product.offers.priceSpecification.valueAddedTaxIncluded, false);
  assert.equal(product.offers.seller['@id'], 'https://www.vomamxenang.com/#organization');
  assert.equal(product.itemCondition, 'https://schema.org/NewCondition');
  assert.equal(product.image, item.imageUrl);
  assert.equal(product.offers.availability, undefined);
  assert.equal(product.aggregateRating, undefined);
});
test('Do not advertise provisional reference price as an Offer', () => {
  const [product] = JSON.parse(contentJsonLd({
    id: 'draft-price', name: 'Vỏ xe nâng tham khảo', sellingPrice: 2800000,
    tags: ['PRICE_REFERENCE_2026'],
  }, 'products'));
  assert.equal(product.offers, undefined);
});
