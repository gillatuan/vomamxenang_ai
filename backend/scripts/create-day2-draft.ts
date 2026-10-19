import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { saveContent } from '../src/content/content-alias';
import type { PrismaService } from '../src/prisma/prisma.service';

export const draft = JSON.parse(readFileSync(join(__dirname, 'day2-post.json'), 'utf8'));
const expectedSlug = 'nhat-ky-chuyen-kho-vo-mam-xe-nang-ngay-2-15-09-2026';

function matches(row: any): boolean {
  return row && ['title', 'slug', 'content', 'excerpt', 'status'].every(key => row[key] === draft[key])
    && JSON.stringify(row.tags) === JSON.stringify(draft.tags)
    && Object.keys(draft.seo).every(key => JSON.stringify(row.seo?.[key]) === JSON.stringify(draft.seo[key]))
    && row.seo?.canonicalPath === '/blog/' + expectedSlug;
}

export async function ensureDraft(db: PrismaClient, dryRun: boolean, create = saveContent) {
  if (draft.slug !== expectedSlug || draft.status !== 'DRAFT' || !draft.content.trim()
    || draft.content.includes('Thông tin biên tập')) throw new Error('INVALID_REVIEWED_DRAFT');
  const current = await db.post.findFirst({
    where: { OR: [{ slug: expectedSlug }, { aliases: { has: expectedSlug } }, { title: draft.title }, { id: expectedSlug }] },
  });
  if (current) {
    if (!matches(current)) throw new Error('EXISTING_ARTICLE_REQUIRES_REVIEW');
    return 'ALREADY_PRESENT_VERIFIED';
  }
  if (dryRun) return 'READY_TO_CREATE_DRAFT';
  const created = await create(db as unknown as PrismaService, 'post', draft);
  const persisted = await db.post.findUnique({ where: { id: created.id } });
  if (!matches(persisted)) throw new Error('PERSISTED_DRAFT_VERIFICATION_FAILED');
  return 'CREATED_DRAFT_VERIFIED';
}

if (require.main === module) {
  const db = new PrismaClient();
  (async () => {
    if (process.env.CONFIRMATION !== 'CREATE-DAY2-DRAFT') throw new Error('CONFIRMATION_REQUIRED');
    const url = new URL(process.env.DATABASE_URL || '');
    if (!['postgresql:', 'postgres:'].includes(url.protocol)) throw new Error('DIRECT_DATABASE_REQUIRED');
    const result = await ensureDraft(db, process.argv.includes('--dry-run'));
    console.log(result);
  })().catch(() => {
    console.error('Day 2 draft operation stopped. Existing articles are never overwritten; no migration or seed is run.');
    process.exitCode = 1;
  }).finally(() => db.$disconnect());
}
