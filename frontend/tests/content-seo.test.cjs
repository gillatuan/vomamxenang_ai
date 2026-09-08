const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
const { linkRelatedContent, slugify, contentPath } = require('../src/lib/content-seo.ts');
const { richTextPlain } = require('../src/lib/rich-text.ts');
const catalog = [
  { id: '2', slug: 'lop-dac', aliases: ['lop-cu'], title: 'Lốp đặc', kind: 'products' },
  { id: '3', slug: 'kiem-tra-mam', title: 'Kiểm tra mâm', kind: 'blog' },
];
const current = { id: '1', kind: 'blog' };
test('Vietnamese aliases and public URLs', () => {
  assert.equal(slugify('Lốp đặc Đà Nẵng 6.00-9'), 'lop-dac-da-nang-6-00-9');
  assert.equal(contentPath(catalog[0], 'products'), '/products/lop-dac');
});
test('links exact phrases once per target and avoids self links', () => {
  const result = linkRelatedContent('Tham khảo lốp đặc. Lốp đặc cần kiểm tra mâm.', catalog, current);
  assert.match(result, /href="\/products\/lop-dac">lốp đặc<\/a>/);
  assert.match(result, /href="\/blog\/kiem-tra-mam">kiểm tra mâm<\/a>/);
  assert.equal((result.match(/href=/g) || []).length, 2);
  assert.equal(richTextPlain(result), 'Tham khảo lốp đặc. Lốp đặc cần kiểm tra mâm.');
  assert.doesNotMatch(linkRelatedContent('Lốp đặc', catalog, { id: '2', kind: 'products' }), /href=/);
});
test('preserves links, code and headings; rewrites old ID/alias links', () => {
  const result = linkRelatedContent('<p><a href="/products/2">Lốp đặc</a> Lốp đặc</p><pre>Kiểm tra mâm</pre><h2>Kiểm tra mâm</h2>', catalog, current);
  assert.equal((result.match(/href=/g) || []).length, 1);
  assert.match(result, /href="\/products\/lop-dac"/);
  assert.match(linkRelatedContent('<a href="/products/lop-cu#size">X</a>', catalog, current), /href="\/products\/lop-dac#size"/);
});
test('does not inject markup or match within words', () => {
  assert.doesNotMatch(linkRelatedContent('<script>alert(1)</script>Lốp đặcc', catalog, current), /<script|href=/);
  const unsafe = [{ id: 'x', slug: 'safe', title: '<img src=x>', kind: 'blog' }];
  assert.doesNotMatch(linkRelatedContent('&lt;img src=x&gt;', unsafe, current), /<img/);
});
test('caps automatic destinations at five and is stable on repeat', () => {
  const items = Array.from({ length: 7 }, (_, index) => ({ id: `${index + 10}`, slug: `mau-${index}`, title: `Mẫu lốp ${index}`, kind: 'products' }));
  const source = items.map(item => item.title).join(', ');
  const linked = linkRelatedContent(source, items, current);
  assert.equal((linked.match(/href=/g) || []).length, 5);
  assert.equal((linkRelatedContent(linked, items, current).match(/href=/g) || []).length, 5);
});
