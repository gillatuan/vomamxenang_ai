import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { sep } from 'node:path';

const key = '20261127120000_product_price_range';
const mode = process.argv[2];
if (mode !== 'dry-run' && mode !== 'apply') throw Error('Expected dry-run or apply');
if (process.env.APP_ENV !== 'production') throw Error('Production environment required');
const raw = process.env.DATABASE_URL;
if (!raw) throw Error('Direct production database URL missing');
const url = new URL(raw);
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname ||
    url.hostname.includes('accelerate.prisma-data.net')) throw Error('Direct PostgreSQL URL required');

function requireBackupProof() {
  if (process.env.CONFIRM_PRODUCT_PRICE_MIGRATION !== 'APPLY-PRODUCT-PRICE-RANGE-PRODUCTION') {
    throw Error('Explicit migration authorization required');
  }
  if (process.env.EXPECTED_PRODUCTION_DATABASE_NAME !== 'postgres' ||
      decodeURIComponent(url.pathname.slice(1)) !== 'postgres') throw Error('Unexpected database identity');
  const root = process.env.PRODUCTION_BACKUP_DIR;
  const marker = process.env.RESTORE_VERIFIED_MARKER;
  if (!root || !marker) throw Error('Fresh isolated restore verification missing');
  const directory = realpathSync(root), file = realpathSync(marker);
  if (!file.startsWith(directory + sep) || statSync(file).size > 16384) throw Error('Invalid restore marker');
  const proof = JSON.parse(readFileSync(file,'utf8'));
  if (proof.restoreVerified !== true || !/^[0-9a-f]{64}$/i.test(proof.sha256 ?? '')) {
    throw Error('Invalid backup and restore proof');
  }
  if (!['FULL_DATABASE','APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION'].includes(proof.restoreScope)) {
    throw Error('Invalid restore scope');
  }
  if (proof.restoreScope === 'APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION' &&
      (process.env.PRISMA_PROVIDER_APP_DATA_RESTORE !== 'YES' ||
       proof.fullOriginalArchivePreserved !== true ||
       !Number.isInteger(proof.excludedProviderEntries) || proof.excludedProviderEntries < 0)) {
    throw Error('Incomplete provider-aware restore proof');
  }
  const age = Date.now() - Date.parse(proof.verifiedAt);
  if (!Number.isFinite(age) || age < -60000 || age > 30 * 60000) throw Error('Restore proof is stale');
  if (!/^[0-9a-f]{40}$/i.test(process.env.AUDITED_SHA ?? '') ||
      proof.revision !== process.env.AUDITED_SHA) throw Error('Audited commit differs from restored commit');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const id = await prisma.$queryRaw<Array<{ name: string }>>`SELECT current_database()::text AS name`;
    if (id.length !== 1 || id[0].name !== 'postgres') throw Error('Unexpected live production DB');
    const local = readdirSync('prisma/migrations', { withFileTypes: true })
      .filter(x => x.isDirectory() && /^20\d{12}_/.test(x.name))
      .map(x => x.name);
    if (!local.includes(key)) throw Error('Price range migration missing from audited repository');
    const history = await prisma.$queryRaw<Array<{
      migration_name: string; checksum: string; finished_at: Date | null; rolled_back_at: Date | null;
    }>>`SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations"`;
    const completed = new Set(history.filter(x => x.finished_at && !x.rolled_back_at).map(x => x.migration_name));
    const unfinished = history.filter(x => !x.finished_at && !x.rolled_back_at);
    if (unfinished.length) throw Error('Failed or unfinished migration records exist; stop and review');

    // Production already has one historical migration that is intentionally absent
    // from current source. The old protected P2.1 workflow verifies its exact SHA-256.
    // Allow ONLY this known, completed and checksum-matched historical record.
    const legacyMigration = '20261004130000_product_category_relation';
    const legacyChecksum = '43e5e770f5d30fa626c7a0447f12e88588e50b0593512fb474bc91e5c335e36a';
    const unknown = [...completed].filter(name => !local.includes(name));
    const unapproved = unknown.filter(name => name !== legacyMigration);
    if (unapproved.length) throw Error('Unknown database migration(s): ' + unapproved.join(', '));
    if (unknown.includes(legacyMigration)) {
      const matching = history.filter(row =>
        row.migration_name === legacyMigration &&
        row.finished_at !== null &&
        row.rolled_back_at === null &&
        row.checksum === legacyChecksum
      );
      if (matching.length !== 1 || history.some(row =>
        row.migration_name === legacyMigration &&
        (row.finished_at === null || row.rolled_back_at !== null || row.checksum !== legacyChecksum)
      )) {
        throw Error('Historical category relation migration checksum/state mismatch; manual audit required');
      }
    }
    const pending = local.filter(name => !completed.has(name));
    console.log(JSON.stringify({mode,database:'postgres',target:key,pending,
      verifiedLegacyMigration:unknown.includes(legacyMigration) ? legacyMigration : null,
      alreadyApplied:completed.has(key)},null,2));
    if (mode === 'dry-run') return;
    requireBackupProof();
    if (pending.length !== 1 || pending[0] !== key) {
      throw Error('Refusing to apply: expected exactly the one reviewed price range migration pending');
    }
    // No $executeRawUnsafe DDL: only Prisma Migrate may record migration history.
    execFileSync('./node_modules/.bin/prisma', ['migrate','deploy'], {
      stdio:'inherit', env:{...process.env, DATABASE_URL:raw},
    });
    const actual = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS count FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product'
        AND column_name IN ('priceMin','priceMax')`;
    if (Number(actual[0]?.count) !== 2) throw Error('Post-deploy price columns not verified');
    const constraint = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)::bigint AS count FROM pg_constraint
      WHERE conname = 'Product_price_range_valid'`;
    if (Number(constraint[0]?.count) !== 1) throw Error('Post-deploy CHECK constraint not found');
    const record = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM "_prisma_migrations"
      WHERE migration_name = ${key} AND finished_at IS NOT NULL AND rolled_back_at IS NULL`;
    if (record.length !== 1) throw Error('Price range migration history not verified');
    console.log('[PRICE RANGE MIGRATION] VERIFIED: columns, CHECK constraint and Prisma migration history');
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(error=>{console.error('[PRICE RANGE MIGRATION] FAILED: ' + (error instanceof Error ? error.message : 'Unknown error'));process.exitCode=1;});
