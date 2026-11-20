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
    category: {
      findMany: async () => [{ id: 'actual-tire-category', name: 'Vỏ xe nâng' }],
      create: async () => { throw new Error('Must not create duplicate category'); },
    },
    product: {
      updateMany: async ({ where, data }: any) => {
        assert(where.sku === 'SEED-PHOENIX-600-9', 'Only original Phoenix SKU may be updated');
        assert(Array.isArray(where.OR) && where.OR.length === 2 && where.OR.some((item: any) => item.sellingPrice === null) && where.OR.some((item: any) => item.sellingPrice === 2100000), 'Only unset or original placeholder price may be updated');
        existingUpdated = data;
        return { count: 1 };
      },
      createMany: async ({ data }: any) => { created.push(...data); return { count: data.length }; },
    },
  };
  await phoenixSolidTireRetail2026Seed.run(db);
  assert(created.length === 3 && !!existingUpdated, 'Exactly 3 new products and 1 guarded update');
  assert(existingUpdated.categoryId === 'actual-tire-category' &&
    created.every(p => p.categoryId === 'actual-tire-category'), 'Reuse real existing category');
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
    category: { findMany: async () => [{ id: 'actual-tire-category', name: 'Vỏ xe nâng' }] },
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
  const createdCategories: any[] = [];
  const noCategoryDb: any = {
    category: {
      findMany: async () => [],
      create: async ({ data }: any) => { createdCategories.push(data); return data; },
    },
    product: {
      updateMany: async ({ data }: any) => {
        assert(data.categoryId === 'category-tires', 'New canonical category must be used');
        return { count: 1 };
      },
      createMany: async ({ data }: any) => {
        assert(data.every((p: any) => p.categoryId === 'category-tires'), 'All new SKUs must reference created category');
        return { count: 3 };
      },
    },
  };
  await phoenixSolidTireRetail2026Seed.run(noCategoryDb);
  assert(createdCategories.length === 1 && createdCategories[0].name === 'Vỏ xe nâng',
    'Create one canonical tire category only when none exists');

  const ambiguousDb: any = {
    category: { findMany: async () => [
      { id: 'category-tires', name: 'Vỏ xe nâng' },
      { id: 'duplicate-category', name: 'Vỏ xe nâng' },
    ] },
    product: { updateMany: async () => { throw new Error('Must not update ambiguous category'); } },
  };
  try {
    await phoenixSolidTireRetail2026Seed.run(ambiguousDb);
    throw new Error('Expected ambiguous category failure');
  } catch (error) {
    assert(error instanceof Error && error.message.includes('Ambiguous forklift tire categories'),
      'Ambiguous categories must fail closed');
  }
  console.log('Phoenix quoted retail catalog checks passed.');
}
main().catch(error => { console.error(error); process.exitCode=1; });
