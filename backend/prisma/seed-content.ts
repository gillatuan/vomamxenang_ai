import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { productionSeeds } from './seeds/production/registry';
import { runProductionSeeds } from './seed-production-runner';

// Local content uses the exact same versioned releases as production. This is
// intentionally separate from seed.ts, which creates local-only accounts and
// operational fixtures.
if (!process.env.DATABASE_URL) config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('[SEED] Synchronizing versioned content releases to local database');
  const summary = await runProductionSeeds(prisma, productionSeeds, false);
  for (const key of summary.executed) console.log(`[SEED:SUCCESS] ${key}`);
  for (const key of summary.skipped) console.log(`[SEED:SKIP] ${key}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
