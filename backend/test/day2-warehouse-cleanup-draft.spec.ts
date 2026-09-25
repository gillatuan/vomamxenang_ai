import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('scripts/create-day2-warehouse-cleanup-draft.ts', 'utf8');
const marker = 'const content = `';
const start = source.indexOf(marker);
const end = source.indexOf('`;\n\nasync function main', start);
assert(start >= 0 && end > start, 'Day 2 content template must be present.');
const content = source.slice(start + marker.length, end);
const plain = content.replace(/<[^>]*>/gu, ' ');
const words = plain.match(/[\p{L}\p{N}]+/gu) ?? [];

assert.equal(source.includes("const slug = 'ngay-don-kho-thu-2-sap-xep-lai-kho-lop-va-mam-xe-nang'"), true);
assert(words.length >= 1200 && words.length <= 1800, `Expected 1,200–1,800 Vietnamese words; found ${words.length}.`);
for (const path of ['/vo-xe-nang', '/mam-xe-nang', '/products']) assert.equal(content.includes(`href=\"${path}\"`), true, `Missing verified internal link: ${path}`);
for (const media of ['kho-cu-mam-lop-01.jpg', 'kho-cu-mam-lop-02.jpg', 'kho-lop-theo-cum-01.jpg', 'cot-lop-sau-sap-xep-01.jpg', 'loi-di-kho-sau-sap-xep-01.jpg']) {
  assert.equal(source.includes(media), true, `Missing Day 2 media reference: ${media}`);
  assert.equal(require('node:fs').existsSync(`../frontend/public/images/campaigns/chuyen-kho-2026/day-2/${media}`), true, `Missing copied media asset: ${media}`);
}
assert.equal(source.includes('videoUrl:'), false, 'A video must not be added because none was supplied.');
assert.equal(source.includes("status: ContentStatus.DRAFT"), true, 'The post must stay DRAFT until media review is complete.');
assert.equal(source.includes('campaignPost.upsert'), true, 'The post must be linked to the existing campaign.');
console.log(`Day 2 draft static checks passed (${words.length} words, verified links, no fake media).`);
