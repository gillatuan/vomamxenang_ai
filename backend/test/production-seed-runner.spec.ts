import { ProductionSeedClient, ProductionSeedTransaction, runProductionSeeds } from '../prisma/seed-production-runner';
import { ProductionSeed } from '../prisma/seeds/production/types';

function expect(value: unknown, message: string): void {
  if (!value) throw new Error(message);
}

class FakeSeedClient implements ProductionSeedClient {
  readonly histories = new Map<string, { key: string; name: string }>();
  readonly products = new Map<string, unknown>();

  readonly product = {
    upsert: async (args: unknown) => {
      const input = args as { where: { slug: string }; create: unknown };
      if (!this.products.has(input.where.slug)) this.products.set(input.where.slug, input.create);
    },
  };

  readonly seedHistory = {
    findUnique: async ({ where }: { where: { key: string } }) => this.histories.get(where.key) ?? null,
    create: async ({ data }: { data: { key: string; name: string } }) => {
      if (this.histories.has(data.key)) throw new Error(`Seed already exists: ${data.key}`);
      const record = { ...data };
      this.histories.set(data.key, record);
      return record;
    },
  };

  async $executeRawUnsafe(): Promise<void> {}

  async $transaction<T>(callback: (transaction: ProductionSeedTransaction) => Promise<T>): Promise<T> {
    const historiesBefore = new Map(this.histories);
    const productsBefore = new Map(this.products);
    try {
      return await callback(this);
    } catch (error) {
      this.histories.clear();
      this.products.clear();
      for (const [key, value] of historiesBefore) this.histories.set(key, value);
      for (const [key, value] of productsBefore) this.products.set(key, value);
      throw error;
    }
  }
}

const successfulSeed: ProductionSeed = {
  key: '003-test-create-products',
  name: 'Test product release',
  preview: { productsToCreate: 2 },
  async run(database) {
    await database.product.upsert({ where: { slug: 'test-a' }, update: {}, create: { slug: 'test-a' } });
    await database.product.upsert({ where: { slug: 'test-b' }, update: {}, create: { slug: 'test-b' } });
  },
};

const failingSeed: ProductionSeed = {
  key: '004-test-rollback',
  name: 'Test rollback',
  preview: { productsToCreate: 1 },
  async run(database) {
    await database.product.upsert({ where: { slug: 'rollback-product' }, update: {}, create: { slug: 'rollback-product' } });
    throw new Error('intentional seed failure');
  },
};

async function main(): Promise<void> {
  const client = new FakeSeedClient();
  const firstRun = await runProductionSeeds(client, [successfulSeed], false);
  expect(firstRun.executed[0] === successfulSeed.key, 'Pending seed must run once.');
  expect(client.histories.has(successfulSeed.key), 'Successful seed must be recorded.');
  expect(client.products.size === 2, 'Seed must create expected products.');

  const secondRun = await runProductionSeeds(client, [successfulSeed], false);
  expect(secondRun.skipped[0] === successfulSeed.key, 'Historical seed must be skipped.');
  expect(client.products.size === 2, 'Second run must not duplicate products.');

  const dryRun = await runProductionSeeds(client, [successfulSeed, failingSeed], true);
  expect(dryRun.pending[0] === failingSeed.key, 'Dry run must report new seed as pending.');
  expect(!client.histories.has(failingSeed.key), 'Dry run must not write SeedHistory.');

  try {
    await runProductionSeeds(client, [failingSeed], false);
    throw new Error('Failing seed unexpectedly completed.');
  } catch (error) {
    expect(error instanceof Error && error.message === 'intentional seed failure', 'Seed failure must be propagated.');
  }
  expect(!client.histories.has(failingSeed.key), 'Failed seed must not be recorded.');
  expect(!client.products.has('rollback-product'), 'Failed seed changes must roll back.');

  const thirdSeed: ProductionSeed = {
    key: '005-test-follow-up', name: 'Test follow-up release', preview: { productsToCreate: 1 },
    async run(database) { await database.product.upsert({ where: { slug: 'test-c' }, update: {}, create: { slug: 'test-c' } }); },
  };
  const thirdRun = await runProductionSeeds(client, [successfulSeed, thirdSeed], false);
  expect(thirdRun.skipped.includes(successfulSeed.key), 'Old seed must remain skipped after adding a new seed.');
  expect(thirdRun.executed.includes(thirdSeed.key), 'New seed must run.');
  console.log('Production seed runner checks passed.');
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
