import { phoenixQuotedPrices, phoenixSolidTireRetail2026Seed } from '../prisma/seeds/production/014-phoenix-solid-tire-retail.seed';

function assert(ok: unknown, message: string): void {
  if (!ok) throw new Error(message);
}
async function main() {
  assert(phoenixQuotedPrices.length === 4, 'Exactly four Phoenix sizes required');
  const seen = new Set<string>();
  for (const p of phoenixQuotedPrices) {
    assert(!seen.has(p.size), 'Duplicate tire size');
    seen.add(p.size);
    assert(p.price > 0, 'Retail price must be positive');
    assert(p.price % 10000 === 0, 'Price must be rounded for retail');
  }
  const created: Array<Record<string, any>> = [];
  let existingUpdated: any = null;
  const db: any = {
    product: {
      updateMany: async ({ where, data }: any) => {
        assert(where.sku === 'SEED-PHOENIX-600-9', 'Only original Phoenix SKU may be updated');
        assert(Array.isArray(where.sellingPrice?.in) && where.sellingPrice.in.length === 2 && where.sellingPrice.in.includes(null) && where.sellingPrice.in.includes(2100000), 'Only unset or original placeholder price may be updated');
        existingUpdated = data;
        return { count: 1 };
      },
      createMany: async ({ data }: any) => { created.push(...data); return { count: data.length }; },
    },
  };
  await phoenixSolidTireRetail2026Seed.run(db);
  assert(created.length === 3 && !!existingUpdated, 'Exactly 3 new products and 1 guarded update');
  for (const p of [...created, existingUpdated]) {
    assert(p.sellingPrice > 0, 'Retail price required');
    assert(p.status === 'PUBLISHED', 'All four products must be published');
    assert(p.brand === 'PHOENIX' && p.tireType === 'SOLID', 'Correct brand and solid tire');
    assert(!p.tags.includes('PRICE_REFERENCE_2026'), 'No external-price reference tag permitted');
    assert(!p.imageUrl, 'Do not insert fabricated product images');
    assert(!JSON.stringify(p).includes('0913600210'), 'No quotation recipient PII');
  }
  assert(created.every(p=>p.minStock===0), 'No fabricated stock threshold');
  const badDb: any = {
    product: {
      updateMany: async () => ({ count: 0 }),
      createMany: async () => { throw new Error('Must not insert if existing price changed'); },
    },
  };
  try {
    await phoenixSolidTireRetail2026Seed.run(badDb);
    throw new Error('Expected update price conflict to stop release');
  } catch (error) {
    assert(error instanceof Error && error.message.includes('manual review required'), 'Must fail closed on price conflict');
  }
  console.log('Phoenix quoted retail catalog checks passed.');
}
main().catch(error => { console.error(error); process.exitCode=1; });
