const { test } = require('node:test');
const assert = require('node:assert/strict');
const { updateArticle, validate } = require('../../scripts/media-update/update-day2.cjs');
const payload = require('../../scripts/media-update/day2-media.json');
function fixture(overrides = {}, count = 1) {
  let row = { id: 'target', slug: payload.slug, title: payload.expectedTitle, content: payload.expectedContent, updatedAt: 'old', status: 'DRAFT', seo: { imageUrl: 'unchanged' }, tags: ['unchanged'], publishedAt: null, ...overrides };
  let writes = 0;
  const db = { $transaction: async callback => callback({ post: {
    findMany: async () => row ? [structuredClone(row)] : [],
    updateMany: async ({ data }) => { writes++; if (count) row = { ...row, ...data, updatedAt: 'new' }; return { count }; },
    findUnique: async () => structuredClone(row),
  } }) };
  return { db, row: () => row, writes: () => writes };
}
test('reviewed payload has seven photos and three controlled videos', validate);
test('updates only article content, preserving published state and metadata', async () => {
  const f = fixture({ status: 'PUBLISHED', publishedAt: 'original-date' });
  const before = structuredClone(f.row());
  const result = await updateArticle(f.db);
  assert.equal(result.result, 'UPDATED_AND_VERIFIED');
  assert.equal(result.status, 'PUBLISHED');
  assert.deepEqual(f.row(), { ...before, content: payload.content, updatedAt: 'new' });
});
test('dry run performs no write', async () => {
  const f = fixture(); assert.equal((await updateArticle(f.db, true)).result, 'READY_TO_UPDATE'); assert.equal(f.writes(), 0);
});
test('rerun is idempotent', async () => {
  const f = fixture({ content: payload.content }); assert.equal((await updateArticle(f.db)).result, 'ALREADY_UPDATED_VERIFIED'); assert.equal(f.writes(), 0);
});
test('stops for changed article content or title', async () => {
  for (const changed of [{ content: 'new user edit' }, { title: 'new title' }]) {
    const f = fixture(changed); await assert.rejects(updateArticle(f.db), /CHANGED/); assert.equal(f.writes(), 0);
  }
});
test('stops on a concurrent edit', async () => {
  const f = fixture({}, 0); await assert.rejects(updateArticle(f.db), /CONCURRENT_EDIT/);
});
