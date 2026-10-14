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
  const legacyRow = active.find(r => r.migration_name === '20260601000000_fix_legacy_schema');
  const historicalVariants = {"55de2bb3ebf8780875f89b6cd7c5b3ec9864e30fe36af3e5daeb5aca14d69319":"original:'\\n':trailing=0:bom=False","65798b8aeb96c3478ba81f13c81d904446d5aa6918650be8830495ed9092e2e6":"original:'\\n':trailing=0:bom=True","0338dd4804e34c607cb9840eb07bab2222e4afd71d0557cb660c678e00000014":"original:'\\n':trailing=1:bom=False","a2c3cf3aa086ed8b4ac2aa9d2f04f2cdf5147f6dfdbe710835ae55d0e3b8aeca":"original:'\\n':trailing=1:bom=True","5adb700f6ae01af80baa607facc4d000915e1b833ec04ac7f30f2015481cfb3f":"original:'\\n':trailing=2:bom=False","e416595cde83386537d9bacbfb664046e56387183ce31404c71076eccf4b4f66":"original:'\\n':trailing=2:bom=True","5492928d075996934eb5af8c20a76cc9824cc4a3b017293e0f00b306a47a7f31":"original:'\\n':trailing=3:bom=False","5600239037b05e5a45201ac56f417b070b943ed4030e1bac23df2987472aa773":"original:'\\n':trailing=3:bom=True","1c90e7ad88e86cb5fe16d64c43812eebc6b9efdaa2a09c2a55098e99d18a421f":"original:'\\r\\n':trailing=0:bom=False","75696365a4dcdf6456af8d5c30eb351722ef91638f873cb7bc5fb1112959d53e":"original:'\\r\\n':trailing=0:bom=True","b5c87433cde5d38eff09cb3d583cb0c29ac8491185d5202a90312eede89f8016":"original:'\\r\\n':trailing=1:bom=False","98acb5a2bcc2742bbb07d23666ea877dd4e07b9d3b5a65d0789b13db4f2ae212":"original:'\\r\\n':trailing=1:bom=True","cd32ef4f86163f98b79b0722f2de5ccd715dc1c73f59fb35343b6e95cfddae3a":"original:'\\r\\n':trailing=2:bom=False","e8b94d696d516103e7a8fec803a2c93d0843156b2f804ca1c1b1e22768445a6c":"original:'\\r\\n':trailing=2:bom=True","cc52abca6cf067f47a58c64022b080905e1d8b5fad0bbc22f6fc3433264e3d80":"original:'\\r\\n':trailing=3:bom=False","676f3c890cc0300642acd21e006ebb38f16a6e5393c58ddc771e8cde9020811d":"original:'\\r\\n':trailing=3:bom=True","fadca78fea75904726f2afc9b6d456e6b006d0f2d3561f5e95b8df5c8189a54b":"corrected:'\\n':trailing=0:bom=False","45b1ed5019879cab484fcbd3691df07d4ab3e38034149e40a4e9b7566234101c":"corrected:'\\n':trailing=0:bom=True","06495db607252113d975ce13b8a37f23141f24ad1e6acd7ff14e1abba5a0057f":"corrected:'\\n':trailing=1:bom=False","aec0c6c38c8b3727a95d6ef408a584b381785838b085b84e047fc7b09f37584c":"corrected:'\\n':trailing=1:bom=True","73b02aeaaaa2f0223c988625e35ad4ee9a7c13562b220b8a06e38174715f6e50":"corrected:'\\n':trailing=2:bom=False","f14c05c3561464d7f0d6819bdabb929f89736bb76a5ad1b0cd99189e3b70e47f":"corrected:'\\n':trailing=2:bom=True","75823db7d0b11c7ff168006c6acfa572898005823dce3617d1586f50e667a1a3":"corrected:'\\n':trailing=3:bom=False","e8cd8942331a1ce3056441190999ddbdda1b9ceb858bc7742942782fb9554c10":"corrected:'\\n':trailing=3:bom=True","4969619f925bc1d01ee9c225dcdb436f0a8125e84e5a2319ab0fc31d078fffd8":"corrected:'\\r\\n':trailing=0:bom=False","1f76374a37b60895deaad393cc4e6d08b7821fd1c6035d231d31bd5e3d3a8f9e":"corrected:'\\r\\n':trailing=0:bom=True","1ad66c004cc92c2dd588e0708369301096c9ede233f27ec9672d0fdac0e242f4":"corrected:'\\r\\n':trailing=1:bom=False","57ccd4b8cb6c5f909866b8a9e46a13078d6ae8afe8aec793b8b39bc98a515a8e":"corrected:'\\r\\n':trailing=1:bom=True","2fb6b6a5bd9a026769acc59b3250aa374fbe8301254fcb0a485af6aac52ac7a4":"corrected:'\\r\\n':trailing=2:bom=False","a33e86608ab7c2feba4432d6b3529f555ed638f255992df35ff54930d63c3fed":"corrected:'\\r\\n':trailing=2:bom=True","82d7d8a901e8b4daaa1c31443c8c3de6554ef1739e5986ae431ea7d5769659fc":"corrected:'\\r\\n':trailing=3:bom=False","fff553c7a498da103bbc59c5e5d436f6a65f53b0c0e5c6f3c510f963990363bb":"corrected:'\\r\\n':trailing=3:bom=True"};
  const legacyHistory = {
    matchedVariant: historicalVariants[legacyRow?.checksum] || null,
    recordedChecksum: /^[a-f0-9]{64}$/.test(legacyRow?.checksum || '') ? legacyRow.checksum : null,
    matchesOriginalSql: legacyRow?.checksum === '0338dd4804e34c607cb9840eb07bab2222e4afd71d0557cb660c678e00000014',
    matchesCorrectedSql: legacyRow?.checksum === '06495db607252113d975ce13b8a37f23141f24ad1e6acd7ff14e1abba5a0057f',
  };
  const hasSeeds = query('SELECT to_json(to_regclass(\'public."SeedHistory"\') IS NOT NULL)');
  const appliedSeeds = hasSeeds ? query('SELECT COALESCE(json_agg(key ORDER BY key), \'[]\'::json) FROM public."SeedHistory"') : [];
  const seedRoot = path.join(__dirname, '../prisma/seeds/production');
  const expectedSeeds = fs.readdirSync(seedRoot).filter(f => f.endsWith('.seed.ts')).flatMap(f => [...fs.readFileSync(path.join(seedRoot, f), 'utf8').matchAll(/key:\\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
  console.log(JSON.stringify({ revision: process.env.AUDITED_SHA, pendingMigrations: pending, legacyHistory, checksumMismatches: mismatches, unresolvedMigrations: unresolved, databaseOnlyMigrations: unknown, seedHistoryExists: hasSeeds, pendingSeeds: expectedSeeds.filter(k => !appliedSeeds.includes(k)), durableBackupPathConfigured: Boolean(process.env.BACKUP_DIR), mutationExecuted: false }, null, 2));
  if (mismatches.length || unresolved.length || unknown.some(r => !r.verifiedLegacy)) process.exitCode = 1;
} catch (error) {
  const safe = ['AUTHENTICATION_FAILED', 'DNS_FAILED', 'CONNECTION_FAILED', 'TLS_FAILED', 'PERMISSION_DENIED', 'DATABASE_NOT_FOUND', 'CLIENT_FAILED'];
  console.error('Read-only preflight failed: ' + (safe.includes(error.message) ? error.message : 'PREFLIGHT_QUERY_FAILED'));
  process.exitCode = 1;
}
