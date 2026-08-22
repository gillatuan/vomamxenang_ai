import { ProductionSeed, ProductionSeedDatabase } from './seeds/production/types';

interface SeedHistoryRecord {
  key: string;
}

export interface ProductionSeedTransaction extends ProductionSeedDatabase {
  seedHistory: {
    findUnique(args: { where: { key: string } }): Promise<SeedHistoryRecord | null>;
    create(args: { data: { key: string; name: string } }): Promise<SeedHistoryRecord>;
  };
  $executeRawUnsafe(query: string): Promise<unknown>;
}

export interface ProductionSeedClient extends ProductionSeedTransaction {
  $transaction<T>(
    callback: (transaction: ProductionSeedTransaction) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T>;
}

export interface ProductionSeedRunSummary {
  executed: string[];
  skipped: string[];
  pending: string[];
  productsToCreate: number;
}

const advisoryLockQuery = "SELECT pg_advisory_xact_lock(hashtext('vomamxenang-production-seeds'))";

export async function runProductionSeeds(
  client: ProductionSeedClient,
  seeds: readonly ProductionSeed[],
  dryRun: boolean,
): Promise<ProductionSeedRunSummary> {
  const summary: ProductionSeedRunSummary = { executed: [], skipped: [], pending: [], productsToCreate: 0 };

  for (const seed of seeds) {
    const existing = await client.seedHistory.findUnique({ where: { key: seed.key } });
    if (existing) {
      summary.skipped.push(seed.key);
      continue;
    }

    if (dryRun) {
      summary.pending.push(seed.key);
      summary.productsToCreate += seed.preview.productsToCreate;
      continue;
    }

    const ran = await client.$transaction(async (transaction) => {
      // PostgreSQL transaction lock serializes concurrent deployment runners.
      await transaction.$executeRawUnsafe(advisoryLockQuery);
      const lockedExisting = await transaction.seedHistory.findUnique({ where: { key: seed.key } });
      if (lockedExisting) return false;

      await seed.run(transaction);
      await transaction.seedHistory.create({ data: { key: seed.key, name: seed.name } });
      return true;
    // Prisma Accelerate caps interactive transactions at 15 seconds.
    }, { maxWait: 15_000, timeout: 15_000 });

    if (ran) {
      summary.executed.push(seed.key);
      summary.productsToCreate += seed.preview.productsToCreate;
    } else {
      summary.skipped.push(seed.key);
    }
  }

  return summary;
}
