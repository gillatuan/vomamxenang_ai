import { PrismaClient, ContentStatus } from '@prisma/client';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { sep } from 'node:path';
import { warehouseDay4Day5PostsSeed } from '../prisma/seeds/production/013-warehouse-day4-day5-posts.seed';
import { runProductionSeeds } from '../prisma/seed-production-runner';

const key = '013-warehouse-day4-day5-posts';
const slugs = [
  'nhat-ky-don-kho-vo-mam-xe-nang-ngay-4-17-09-2026',
  'ngay-5-chuyen-kho-vo-xe-nang-18-09-2026',
];
const mode = process.argv[2];
if (mode !== 'dry-run' && mode !== 'apply') throw new Error('Usage: seed-warehouse-day4-day5.ts dry-run|apply');
if (process.env.APP_ENV !== 'production') throw new Error('APP_ENV=production is required');
if (warehouseDay4Day5PostsSeed.key !== key) throw new Error('Unexpected seed release');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DIRECT_DATABASE_URL is missing');
const url = new URL(databaseUrl);
if (!['postgresql:', 'postgres:'].includes(url.protocol) || !url.hostname || !url.pathname.slice(1) ||
    url.hostname.includes('accelerate.prisma-data.net')) throw new Error('Direct PostgreSQL URL required');
const expectedDb = process.env.EXPECTED_PRODUCTION_DATABASE_NAME?.trim() || '';
// Dry-run discovers the live database name; writes still require explicit operator approval.
if (mode === 'apply') {
  if (!expectedDb || !/^[a-zA-Z0-9_\-]+$/.test(expectedDb)) throw new Error('Expected database name required for apply');
  if (decodeURIComponent(url.pathname.slice(1)) !== expectedDb) throw new Error('Configured URL database name mismatch');
}
const prisma = new PrismaClient();

function requireFreshVerifiedBackup(): void {
  if (process.env.CONFIRM_WAREHOUSE_SEED_013 !== 'APPLY-SEED-013-PRODUCTION')
    throw new Error('Explicit confirmation missing');
  const markerPath = process.env.RESTORE_VERIFIED_MARKER;
  const backupRoot = process.env.PRODUCTION_BACKUP_DIR;
  if (!markerPath || !backupRoot) throw new Error('Verified durable backup is required');
  const marker = realpathSync(markerPath);
  const root = realpathSync(backupRoot);
  if (!marker.startsWith(root + sep)) throw new Error('Backup marker is outside durable root');
  if (statSync(marker).size > 16384) throw new Error('Backup marker too large');
  const verified = JSON.parse(readFileSync(marker, 'utf8'));
  if (verified.restoreVerified !== true || !/^[0-9a-f]{64}$/i.test(verified.sha256 ?? ''))
    throw new Error('Isolated restore was not verified');
  const timestamp = Date.parse(verified.verifiedAt);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > 30 * 60_000 || timestamp > Date.now() + 60_000)
    throw new Error('Backup must be verified within 30 minutes of apply');
  if (!/^[a-f0-9]{40}$/i.test(process.env.AUDITED_SHA ?? '') || verified.revision !== process.env.AUDITED_SHA)
    throw new Error('Backup revision does not match audited revision');
}

async function main(): Promise<void> {
  const identity = await prisma.$queryRaw<Array<{ name: string; server: string | null }>>`
    SELECT current_database()::text AS name, inet_server_addr()::text AS server
  `;
  if (identity.length !== 1 || !identity[0].name || !identity[0].server)
    throw new Error('Live database identity check failed');
  if (mode === 'apply' && identity[0].name !== expectedDb)
    throw new Error('Live database name does not match approved name');
  if (mode === 'dry-run') {
    console.log('[SEED 013] Detected production database name: ' + identity[0].name);
    console.log('[SEED 013] Copy this exact name into expected_database_name when choosing apply.');
  }
  const before = await prisma.post.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, status: true },
  });
  const record = await prisma.seedHistory.findUnique({ where: { key }, select: { key: true } });
  console.log(JSON.stringify({ mode, database: identity[0].name, seed: key,
    alreadyApplied: !!record, existingPosts: before.map(({ slug, status }) => ({ slug, status })) }, null, 2));
  if (mode === 'dry-run') {
    console.log('[SEED 013] READ-ONLY DRY RUN COMPLETE');
    return;
  }
  requireFreshVerifiedBackup();
  // Only seed 013 is passed to the transactional, advisory-locked seed runner.
  const summary = await runProductionSeeds(prisma, [warehouseDay4Day5PostsSeed], false);
  const after = await prisma.post.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, status: true, content: true },
  });
  if (after.length !== 2 || after.some(p => p.status !== ContentStatus.PUBLISHED || !p.content))
    throw new Error('Post-write verification failed: both published posts required');
  console.log(JSON.stringify({ executed: summary.executed, skipped: summary.skipped,
    published: after.map(({ slug, status }) => ({ slug, status })) }, null, 2));
}
main().catch((error: unknown) => {
  console.error('[SEED 013] FAILED:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
