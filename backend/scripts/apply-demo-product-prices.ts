import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { suggestDemoPrice } from './demo-product-prices';

// This command is specifically for staging/local databases; NEVER production.
// It defaults to preview and requires two opt-ins for writes.
if (!process.env.DATABASE_URL) config({ path: '.env.local' });
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required.');
const parsed = new URL(url);
const dbName = decodeURIComponent(parsed.pathname.replace(/^\\//, '')).toLowerCase();
const apply = process.argv.includes('--apply');
const isApprovedName = /(^|[_-])(demo|test|staging|sandbox)([_-]|$)/.test(dbName);
const forbiddenHost = /prisma-data|neon|supabase|production|prod\\b/i.test(parsed.hostname);
if (!isApprovedName || forbiddenHost || process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production') {
  throw new Error('Refusing demo pricing: use a dedicated non-production database named *_demo, *_test or *_staging (not production).');
}
if (apply && process.env.ALLOW_DEMO_PRICE_WRITE !== 'YES') {
  throw new Error('Set ALLOW_DEMO_PRICE_WRITE=YES and --apply to write demo prices.');
}

const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED', sellingPrice: null },
    select: { id: true, sku: true, type: true, name: true, size: true, brand: true, tireType: true, condition: true, sellingPrice: true },
  });
  const priced = products.map((product) => ({ product, suggestion: suggestDemoPrice(product) }))
    .filter((entry) => entry.suggestion !== null);
  console.log(JSON.stringify({
    mode: apply ? 'APPLY DEMO PRICES' : 'DRY RUN',
    database: dbName,
    totalUnpriced: products.length,
    supported: priced.length,
    unsupported: products.length - priced.length,
    suggestions: priced.map(({ product, suggestion }) => ({
      id: product.id, sku: product.sku, name: product.name,
      priceVnd: suggestion!.amount, source: suggestion!.source, note: suggestion!.note,
    })),
  }, null, 2));
  if (!apply) return;
  let applied = 0;
  for (const { product, suggestion } of priced) {
    // Optimistic predicate: never overwrite a value supplied by an operator between read/write.
    const result = await prisma.product.updateMany({
      where: { id: product.id, sellingPrice: null, status: 'PUBLISHED' },
      data: { sellingPrice: suggestion!.amount },
    });
    applied += result.count;
  }
  console.log(`[DEMO PRICING] Updated ${applied} products. No existing prices overwritten.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
