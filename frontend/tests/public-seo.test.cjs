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
