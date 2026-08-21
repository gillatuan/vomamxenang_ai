import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { productionSeeds } from './seeds/production/registry';
import { runProductionSeeds } from './seed-production-runner';

// CI supplies DATABASE_URL directly. This fallback makes the command usable by
// an operator with an uncommitted .env.production file, without overriding CI.
if (!process.env.DATABASE_URL) config({ path: '.env.production' });

if (process.env.APP_ENV !== 'production' && process.env.NODE_ENV !== 'production') {
  throw new Error('Production seed refused: set APP_ENV=production or NODE_ENV=production.');
}

const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log(`[SEED] Environment: production${dryRun ? ' (dry run)' : ''}`);
  const summary = await runProductionSeeds(prisma, productionSeeds, dryRun);
  for (const key of summary.executed) console.log(`[SEED:SUCCESS] ${key}`);
  for (const key of summary.skipped) console.log(`[SEED:SKIP] ${key}`);
  for (const key of summary.pending) console.log(`[SEED:PENDING] ${key}`);
  console.log(`[SEED] Products to create: ${summary.productsToCreate}`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[SEED:ERROR] ${message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
