import { PrismaClient } from '@prisma/client';
import { getReferencePrice, REFERENCE_PRICE_TAG } from './reference-product-prices';

// One-time, guarded reference-price backfill.
// Both production and staging require explicit environment, approval, and database scope.
// Dry run is default. Export a full database backup before applying to production.
const mode = process.env.REFERENCE_PRICE_ENV;
const apply = process.argv.includes('--apply');
const connection = process.env.REFERENCE_PRICE_DATABASE_URL;
if (mode !== 'production' && mode !== 'staging') throw new Error('REFERENCE_PRICE_ENV must be production or staging.');
if (!connection) throw new Error('REFERENCE_PRICE_DATABASE_URL required; DATABASE_URL is not automatically reused.');
const u = new URL(connection);
const dbName = decodeURIComponent(u.pathname.slice(1));
const expectedDbName = process.env.REFERENCE_PRICE_EXPECT_DB;
if (!expectedDbName || dbName !== expectedDbName) throw new Error('Database name mismatch: specify REFERENCE_PRICE_EXPECT_DB.');
if (!/^postgres(ql)?:$/.test(u.protocol)) throw new Error('PostgreSQL only.');
if (apply && process.env.CONFIRM_REFERENCE_PRICE_APPLY !== 'YES') throw new Error('Explicit apply confirmation missing.');
if (mode === 'production' && apply && process.env.CONFIRM_PRODUCTION_REFERENCE_PRICES !== 'YES') throw new Error('Production requires additional confirmation.');
const prisma = new PrismaClient({ datasources: { db: { url: connection } } });
async function main() {
  const products = await prisma.product.findMany({
    where: { sellingPrice: null, status: 'PUBLISHED' },
    select: { id: true, sku: true, name: true, type: true, brand: true, size: true, tireType: true, condition: true, sellingPrice: true, tags: true },
  });
  const matches = products.flatMap(p => { const price = getReferencePrice(p); return price ? [{ p, price }] : []; });
  const summary = {
    mode, operation: apply ? 'APPLY' : 'DRY_RUN', database: dbName,
    totalMissing: products.length, eligible: matches.length, excluded: products.length - matches.length,
    changes: matches.map(({p,price}) => ({sku:p.sku, productId:p.id, brand:p.brand, size:p.size, price:price.amount, source:price.source})),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!apply) return;
  let count = 0;
  for (const {p,price} of matches) {
    // Conditional price update: never overwrite a value added since initial read.
    const changed = await prisma.product.updateMany({
      where: { id:p.id, sellingPrice:null, status:'PUBLISHED' },
      data: { sellingPrice: price.amount, tags: Array.from(new Set([...p.tags,REFERENCE_PRICE_TAG])) },
    });
    count += changed.count;
  }
  console.log(JSON.stringify({success:true,updated:count,skipped:matches.length-count}));
}
main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
