import { PrismaClient, ContentStatus } from '@prisma/client';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { sep } from 'node:path';
import { phoenixQuotedPrices, phoenixSolidTireRetail2026Seed } from '../prisma/seeds/production/014-phoenix-solid-tire-retail.seed';
import { phoenixVatDisclosureSeed } from '../prisma/seeds/production/015-phoenix-vat-disclosure.seed';
import { runProductionSeeds } from '../prisma/seed-production-runner';

const seeds = [phoenixSolidTireRetail2026Seed, phoenixVatDisclosureSeed] as const;
const mode = process.argv[2];
if (mode !== 'dry-run' && mode !== 'apply') throw new Error('Usage: seed-phoenix-014-015.ts dry-run|apply');
if (process.env.APP_ENV !== 'production') throw new Error('APP_ENV=production required');
if (seeds[0].key !== '014-phoenix-solid-tire-retail-2026' || seeds[1].key !== '015-phoenix-vat-disclosure')
  throw new Error('Unexpected release identifiers');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Production direct PostgreSQL URL is missing');
const parsed = new URL(databaseUrl);
if (!['postgresql:', 'postgres:'].includes(parsed.protocol) || !parsed.hostname ||
    !parsed.pathname.slice(1) || parsed.hostname.includes('accelerate.prisma-data.net'))
  throw new Error('Direct PostgreSQL URL required');
const expectedName = process.env.EXPECTED_PRODUCTION_DATABASE_NAME?.trim() ?? '';
if (mode === 'apply') {
  if (expectedName !== 'postgres') throw new Error('Explicitly confirm production database postgres');
  if (decodeURIComponent(parsed.pathname.slice(1)) !== expectedName)
    throw new Error('Configured URL database name does not match approved database');
}
const prisma = new PrismaClient();

function requireVerifiedBackup(): void {
  if (process.env.CONFIRM_PHOENIX_SEEDS !== 'APPLY-PHOENIX-014-015-PRODUCTION')
    throw new Error('Explicit apply confirmation missing');
  const markerPath = process.env.RESTORE_VERIFIED_MARKER;
  const rootPath = process.env.PRODUCTION_BACKUP_DIR;
  if (!markerPath || !rootPath) throw new Error('Fresh isolated restore proof required');
  const marker = realpathSync(markerPath);
  const root = realpathSync(rootPath);
  if (!marker.startsWith(root + sep) || statSync(marker).size > 16384)
    throw new Error('Restore verification marker invalid');
  const verified = JSON.parse(readFileSync(marker, 'utf8'));
  if (verified.restoreVerified !== true || !/^[a-f0-9]{64}$/i.test(verified.sha256 ?? ''))
    throw new Error('Isolated restore not verified');
  if (!['FULL_DATABASE', 'APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION'].includes(verified.restoreScope))
    throw new Error('Restore scope invalid');
  if (verified.restoreScope === 'APPLICATION_DATA_ONLY_EXCLUDES_PRISMA_PROVIDER_EXTENSION' &&
      (process.env.PRISMA_PROVIDER_APP_DATA_RESTORE !== 'YES' ||
       verified.fullOriginalArchivePreserved !== true ||
       !Number.isInteger(verified.excludedProviderEntries) ||
       verified.excludedProviderEntries < 0))
    throw new Error('Prisma provider-scoped restore proof invalid');
  const timestamp = Date.parse(verified.verifiedAt);
  if (!Number.isFinite(timestamp) || timestamp > Date.now() + 60000 || Date.now() - timestamp > 30 * 60000)
    throw new Error('Restore proof is stale');
  if (!/^[a-f0-9]{40}$/i.test(process.env.AUDITED_SHA ?? '') || verified.revision !== process.env.AUDITED_SHA)
    throw new Error('Backup verification commit mismatch');
}

async function main(): Promise<void> {
  const identity = await prisma.$queryRaw<Array<{ name: string; server: string | null }>>`
    SELECT current_database()::text AS name, inet_server_addr()::text AS server
  `;
  if (identity.length !== 1 || !identity[0].name || !identity[0].server)
    throw new Error('Live database identity check failed');
  if (mode === 'apply' && identity[0].name !== expectedName)
    throw new Error('Live production database name mismatch');

  const keys = seeds.map(seed => seed.key);
  const histories = await prisma.seedHistory.findMany({
    where: { key: { in: keys } }, select: { key: true },
  });
  const applied = new Set(histories.map(history => history.key));
  const products = await prisma.product.findMany({
    where: { sku: { in: phoenixQuotedPrices.map(p => p.sku) } },
    select: { sku: true, brand: true, size: true, condition: true, tireType: true,
              sellingPrice: true, status: true, tags: true },
  });
  // Log only the four SKUs and prices; never log the DB connection or supplier costs.
  console.log(JSON.stringify({
    mode, database: identity[0].name,
    seeds: keys.map(key => ({ key, applied: applied.has(key) })),
    products: products.map(p => ({ sku: p.sku, price: p.sellingPrice,
      published: p.status === ContentStatus.PUBLISHED,
      vatDisclosure: p.tags.includes('VAT_EXCLUDED_INVOICE_AVAILABLE') })),
  }, null, 2));
  if (applied.has(seeds[1].key) && !applied.has(seeds[0].key))
    throw new Error('Seed history out of order: seed 015 exists without seed 014');

  if (!applied.has(seeds[0].key)) {
    const existing = products.find(p => p.sku === 'SEED-PHOENIX-600-9');
    if (!existing || existing.brand !== 'PHOENIX' || existing.size !== '6.00-9' ||
        existing.condition !== 'NEW_100' || existing.tireType !== 'SOLID' ||
        existing.sellingPrice !== 2100000)
      throw new Error('Original PHOENIX 6.00-9 no longer matches price guard; review before apply');
    if (products.some(p => p.sku !== 'SEED-PHOENIX-600-9'))
      throw new Error('One of the three new PHOENIX SKUs already exists; review before apply');
  }
  if (!applied.has(seeds[1].key) && applied.has(seeds[0].key)) {
    if (products.length !== 4 || phoenixQuotedPrices.some(entry => {
      const product = products.find(p => p.sku === entry.sku);
      return !product || product.sellingPrice !== entry.price ||
        product.tags.includes('VAT_EXCLUDED_INVOICE_AVAILABLE');
    })) throw new Error('Seed 015 preflight: PHOENIX products missing, repriced or already tagged');
  }
  if (mode === 'dry-run') {
    console.log('[PHOENIX 014+015] READ-ONLY DRY-RUN PASSED');
    return;
  }

  requireVerifiedBackup();
  const summary = await runProductionSeeds(prisma, seeds, false);
  const after = await prisma.product.findMany({
    where: { sku: { in: phoenixQuotedPrices.map(p => p.sku) } },
    select: { sku: true, sellingPrice: true, status: true, tags: true },
  });
  if (after.length !== 4 || phoenixQuotedPrices.some(entry => {
    const p = after.find(item => item.sku === entry.sku);
    return !p || p.sellingPrice !== entry.price || p.status !== ContentStatus.PUBLISHED ||
      !p.tags.includes('VAT_EXCLUDED_INVOICE_AVAILABLE');
  })) throw new Error('Post-apply verification failed: expected four published PHOENIX products with VAT note');
  console.log(JSON.stringify({
    executed: summary.executed, skipped: summary.skipped,
    verifiedProducts: after.map(p => ({ sku: p.sku, sellingPrice: p.sellingPrice,
      vatExcludedInvoiceAvailable: p.tags.includes('VAT_EXCLUDED_INVOICE_AVAILABLE') })),
  }, null, 2));
}
main().catch((error: unknown) => {
  console.error('[PHOENIX 014+015] FAILED:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
