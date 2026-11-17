const { test } = require('node:test');
const assert = require('node:assert/strict');
const { providerRestoreList } = require('../scripts/prisma-provider-restore-list.cjs');
const toc = [
  '; pg_restore TOC list',
  '1; 0 0 EXTENSION - prisma_postgres postgres',
  '2; 0 0 COMMENT - EXTENSION prisma_postgres postgres',
  '3; 1259 100 TABLE public Post postgres',
  '4; 0 101 TABLE DATA public Post postgres',
  '5; 2606 102 CONSTRAINT public Post Post_pkey postgres',
  '',
].join('\n');

test('skip only the provider extension and its comment', () => {
  const { list, excludedEntries } = providerRestoreList(toc);
  assert.equal(excludedEntries, 2);
  assert.match(list, /^;1; 0 0 EXTENSION - prisma_postgres postgres$/m);
  assert.match(list, /^;2; 0 0 COMMENT - EXTENSION prisma_postgres postgres$/m);
  for (const id of [3,4,5]) assert.match(list, new RegExp('^'+id+';', 'm'));
});
test('do not omit any unrelated SQL objects or extensions', () => {
  const { list } = providerRestoreList(toc + '6; 0 0 EXTENSION - pg_trgm postgres\n');
  assert.match(list, /^6; 0 0 EXTENSION - pg_trgm postgres$/m);
});
test('fail closed when provider extension absent or duplicate', () => {
  assert.throws(() => providerRestoreList(toc.replace('EXTENSION - prisma_postgres', 'EXTENSION - other')));
  assert.throws(() => providerRestoreList(toc + '7; 0 0 EXTENSION - prisma_postgres postgres\n'));
});
test('reject attempts to omit application data', () => {
  const { list } = providerRestoreList(toc.replace('TABLE DATA public Post postgres','TABLE DATA public Product postgres'));
  assert.match(list, /^4; 0 101 TABLE DATA public Product postgres$/m);
});
