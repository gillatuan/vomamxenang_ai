const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync('src/app/admin/seo/[[...section]]/page.tsx', 'utf8');
const api = fs.readFileSync('src/lib/seo-admin.ts', 'utf8');
const campaign = fs.readFileSync('../backend/scripts/create-batch2-day1-campaign.ts', 'utf8');

for (const section of ['Keywords', 'Internal Links', 'Campaigns', 'Product cần chú ý', 'Post cần chú ý']) assert(page.includes(section), `Missing SEO UI section: ${section}`);
for (const method of ['createKeyword', 'updateKeyword', 'deleteKeyword', 'audit', 'updateInternalLink', 'createCampaign', 'updateCampaign']) assert(api.includes(method), `Missing Batch 2 API integration: ${method}`);
assert(!page.includes("'/admin/seo/research'"), 'Batch 2 UI must not expose backlink research.');
assert(campaign.includes("name: 'Chuyển kho 2026'"), 'Campaign draft is missing.');
assert.equal((campaign.match(/title: '/g) || []).length >= 10, true, 'Need at least ten generated draft/plans.');
for (const file of ['kho-chong-lop-01.png', 'kho-chong-lop-02.png', 'loi-di-kho-01.png', 'goc-kho-01.png', 'video-goc-kho-ngay-1.mov']) assert(fs.existsSync(`public/images/campaigns/chuyen-kho-2026/day-1/${file}`), `Missing media asset: ${file}`);
console.log('Batch 2 SEO admin contract checks passed.');
