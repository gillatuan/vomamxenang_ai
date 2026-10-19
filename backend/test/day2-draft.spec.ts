import assert from 'node:assert/strict';
import { draft, ensureDraft } from '../scripts/create-day2-draft';

async function main() {
  let writes = 0;
  let row: any = null;
  const db: any = { post: {
    findFirst: async () => row,
    findUnique: async () => row,
  } };
  const create: any = async (_db: unknown, kind: string, data: any) => {
    writes++;
    assert.equal(kind, 'post');
    assert.equal(data.status, 'DRAFT');
    row = { ...data, id: 'fixture-only', seo: { ...data.seo, canonicalPath: '/blog/' + data.slug } };
    return row;
  };
  assert.equal(await ensureDraft(db, true, create), 'READY_TO_CREATE_DRAFT');
  assert.equal(writes, 0, 'dry-run must not write');
  assert.equal(await ensureDraft(db, false, create), 'CREATED_DRAFT_VERIFIED');
  assert.equal(writes, 1);
  assert.equal(await ensureDraft(db, false, create), 'ALREADY_PRESENT_VERIFIED');
  assert.equal(writes, 1, 'rerun must not duplicate');
  row = { ...row, status: 'PUBLISHED' };
  await assert.rejects(ensureDraft(db, false, create), /EXISTING_ARTICLE_REQUIRES_REVIEW/);
  assert.equal(writes, 1, 'existing published article must remain unchanged');
  row = { ...row, status: 'DRAFT', content: 'An editor changed this article.' };
  await assert.rejects(ensureDraft(db, false, create), /EXISTING_ARTICLE_REQUIRES_REVIEW/);
  assert.equal(writes, 1, 'editor changes must remain unchanged');
  assert.equal((draft.content.match(/<img /g) || []).length, 2);
  console.log('Day 2 draft: dry-run, create, rerun and conflict checks pass.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
