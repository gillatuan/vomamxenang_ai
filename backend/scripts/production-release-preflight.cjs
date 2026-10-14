const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { pgEnv, classifyFailure } = require('./db-audit-backup.cjs');
function query(sql) {
  const env = pgEnv(process.env.PRODUCTION_DATABASE_URL);
  env.PGOPTIONS += ' -c default_transaction_read_only=on';
  const r = spawnSync('psql', ['-XqAt', '-v', 'ON_ERROR_STOP=1'], { env, input: 'BEGIN READ ONLY; ' + sql + '; COMMIT;', encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error(classifyFailure(r.stderr || ''));
  return JSON.parse(r.stdout.trim());
}
try {
  const migrations = query('SELECT COALESCE(json_agg(row_to_json(m)), \'[]\'::json) FROM (SELECT migration_name, checksum, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS rolled_back FROM public."_prisma_migrations" ORDER BY migration_name) m');
  const root = path.join(__dirname, '../prisma/migrations');
  const files = fs.readdirSync(root).filter(f => fs.existsSync(path.join(root, f, 'migration.sql')));
  const active = migrations.filter(r => r.finished && !r.rolled_back);
  const pending = files.filter(f => !active.some(r => r.migration_name === f));
  const mismatches = active.filter(r => files.includes(r.migration_name) && crypto.createHash('sha256').update(fs.readFileSync(path.join(root, r.migration_name, 'migration.sql'))).digest('hex') !== r.checksum).map(r => r.migration_name);
  const unresolved = migrations.filter(r => !r.finished && !r.rolled_back).map(r => r.migration_name);
  const unknown = active.filter(r => !files.includes(r.migration_name)).map(r => ({ name: r.migration_name, verifiedLegacy: r.migration_name === '20261004130000_product_category_relation' && r.checksum === '43e5e770f5d30fa626c7a0447f12e88588e50b0593512fb474bc91e5c335e36a' }));
  const hasSeeds = query('SELECT to_json(to_regclass(\'public."SeedHistory"\') IS NOT NULL)');
  const appliedSeeds = hasSeeds ? query('SELECT COALESCE(json_agg(key ORDER BY key), \'[]\'::json) FROM public."SeedHistory"') : [];
  const seedRoot = path.join(__dirname, '../prisma/seeds/production');
  const expectedSeeds = fs.readdirSync(seedRoot).filter(f => f.endsWith('.seed.ts')).flatMap(f => [...fs.readFileSync(path.join(seedRoot, f), 'utf8').matchAll(/key:\\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
  console.log(JSON.stringify({ revision: process.env.AUDITED_SHA, pendingMigrations: pending, checksumMismatches: mismatches, unresolvedMigrations: unresolved, databaseOnlyMigrations: unknown, seedHistoryExists: hasSeeds, pendingSeeds: expectedSeeds.filter(k => !appliedSeeds.includes(k)), durableBackupPathConfigured: Boolean(process.env.BACKUP_DIR), mutationExecuted: false }, null, 2));
  if (mismatches.length || unresolved.length || unknown.some(r => !r.verifiedLegacy)) process.exitCode = 1;
} catch (error) {
  const safe = ['AUTHENTICATION_FAILED', 'DNS_FAILED', 'CONNECTION_FAILED', 'TLS_FAILED', 'PERMISSION_DENIED', 'DATABASE_NOT_FOUND', 'CLIENT_FAILED'];
  console.error('Read-only preflight failed: ' + (safe.includes(error.message) ? error.message : 'PREFLIGHT_QUERY_FAILED'));
  process.exitCode = 1;
}
