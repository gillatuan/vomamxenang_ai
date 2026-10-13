const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const readline = require('node:readline');

function validate(env) {
  const keys = ['PRODUCTION_DATABASE_URL', 'LOCAL_DATABASE_URL', 'TEMP_RESTORE_ADMIN_URL', 'TEMP_RESTORE_DATABASE_URL'];
  const urls = keys.map(key => {
    try {
      const u = new URL(env[key]);
      if (!['postgres:', 'postgresql:'].includes(u.protocol) || !u.hostname || !u.pathname.slice(1) || u.searchParams.has('host') || u.searchParams.has('hostaddr') || u.searchParams.has('dbname')) throw Error();
      return u;
    } catch { throw new Error(`Invalid direct PostgreSQL configuration: ${key}`); }
  });
  const [prod, local, admin, restore] = urls;
  const db = u => decodeURIComponent(u.pathname.slice(1));
  const endpoint = u => `${u.hostname}:${u.port || '5432'}`;
  const name = db(restore);
  if (!/^vmx_restore_[a-z0-9_]+$/.test(name) || name === db(prod) || name === db(local) || name === db(admin)) throw new Error('Restore database must have a unique vmx_restore_ name');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(restore.hostname) || endpoint(admin) !== endpoint(restore)) throw new Error('Restore/admin must use the same isolated loopback PostgreSQL server');
  if (endpoint(prod) === endpoint(local) && db(prod) === db(local)) throw new Error('Production and local databases must differ');
  return { name };
}
function run(command, args, url, input) {
  const r = spawnSync(command, args, { env: { ...process.env, PGDATABASE: url, PGCONNECT_TIMEOUT: '15', PGOPTIONS: '-c statement_timeout=600000 -c timezone=UTC' }, input, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  // PostgreSQL errors may contain connection credentials or private row data.
  if (r.error || r.status !== 0) throw new Error(`${command} failed; no credentials or database output logged`);
  return r.stdout;
}
const query = (url, sql) => run('psql', ['-XqAt', '-F', '\t', '-v', 'ON_ERROR_STOP=1'], url, sql);
const quote = value => '"' + value.replaceAll('"', '""') + '"';
async function snapshot(url) {
  const child = spawn('psql', ['-XqAt', '-v', 'ON_ERROR_STOP=1'], { env: { ...process.env, PGDATABASE: url, PGCONNECT_TIMEOUT: '15' }, stdio: ['pipe', 'pipe', 'ignore'] });
  child.stdin.on('error', () => {});
  const lines = readline.createInterface({ input: child.stdout });
  const id = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('Snapshot connection timed out')); }, 30000);
    child.once('error', () => { clearTimeout(timer); reject(new Error('Snapshot connection failed')); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Snapshot connection closed')); });
    lines.once('line', line => { clearTimeout(timer); resolve(line); });
    child.stdin.write('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SELECT pg_export_snapshot();\n');
  });
  if (!/^[0-9A-F]+-[0-9A-F]+-[0-9]+$/i.test(id)) { child.kill(); throw new Error('Invalid exported snapshot'); }
  return { id, close: () => { lines.close(); child.stdin.end('ROLLBACK;\n'); } };
}
function inventory(url, snapshotId) {
  const q = sql => query(url, snapshotId ? `BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY; SET TRANSACTION SNAPSHOT '${snapshotId}'; ${sql}; COMMIT;` : sql);
  const tables = q("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename").trim().split('\n').filter(Boolean);
  if (!tables.includes('_prisma_migrations')) throw new Error('Missing Prisma migration ledger');
  const counts = tables.map(t => `${t}\t${q(`SELECT count(*) FROM public.${quote(t)}`).trim()}`).join('\n') + '\n';
  const migrations = q('SELECT migration_name, checksum, COALESCE(finished_at::text,\'\'), COALESCE(rolled_back_at::text,\'\') FROM public."_prisma_migrations" ORDER BY migration_name, started_at');
  const seeds = tables.includes('SeedHistory') ? q('SELECT key FROM public."SeedHistory" ORDER BY key') : '';
  const seedTables = tables.filter(t => /^(SeedHistory|AboutPage|Category|Location|Post|Product|SeoKeyword|Stock|StockLocation|StoreInfo|Warehouse|WheelRim)$/.test(t));
  // Fingerprints detect equal-count content drift without writing customer data to reports.
  const content = seedTables.map(t => `${t}\t${crypto.createHash('sha256').update(q(`SELECT (to_jsonb(t) - 'createdAt' - 'updatedAt' - 'executedAt')::text FROM public.${quote(t)} t ORDER BY (to_jsonb(t) - 'createdAt' - 'updatedAt' - 'executedAt')::text`)).digest('hex')}`).join('\n') + '\n';
  return { counts, migrations, seeds, content };
}
async function main() {
  const env = process.env;
  const { name } = validate(env);
  const root = path.resolve(env.BACKUP_DIR || path.join(os.homedir(), 'vomamxenang-private-backups'));
  const repo = path.resolve(__dirname, '../..');
  if (root === repo || root.startsWith(repo + path.sep)) throw new Error('BACKUP_DIR must be outside the repository');
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const realRoot = fs.realpathSync(root), realRepo = fs.realpathSync(repo);
  if (realRoot === realRepo || realRoot.startsWith(realRepo + path.sep)) throw new Error('BACKUP_DIR symlink resolves inside repository');
  const dir = fs.mkdtempSync(path.join(root, new Date().toISOString().replaceAll(':', '-') + '-'));
  fs.chmodSync(dir, 0o700);
  const write = (name, data) => fs.writeFileSync(path.join(dir, name), data, { mode: 0o600 });
  let created = false, prodSnapshot, localSnapshot;
  try {
    const identitySql = 'SELECT inet_server_addr(), inet_server_port(), current_database()';
    if (query(env.PRODUCTION_DATABASE_URL, identitySql) === query(env.LOCAL_DATABASE_URL, identitySql)) throw new Error('Production and local connections resolve to the same database');
    // CREATE intentionally fails if the target already exists; never DROP an unowned DB.
    query(env.TEMP_RESTORE_ADMIN_URL, `CREATE DATABASE ${quote(name)} TEMPLATE template0`);
    created = true;
    prodSnapshot = await snapshot(env.PRODUCTION_DATABASE_URL);
    localSnapshot = await snapshot(env.LOCAL_DATABASE_URL);
    const archive = path.join(dir, 'production.dump');
    run('pg_dump', ['--format=custom', '--no-owner', '--no-acl', `--snapshot=${prodSnapshot.id}`, `--file=${archive}`], env.PRODUCTION_DATABASE_URL);
    if (!fs.statSync(archive).size) throw new Error('Empty backup');
    write('restore-toc.txt', run('pg_restore', ['--list', archive]));
    const digest = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(archive)) digest.update(chunk);
    const checksum = digest.digest('hex');
    write('production.dump.sha256', checksum + '  production.dump\n');
    const prod = inventory(env.PRODUCTION_DATABASE_URL, prodSnapshot.id);
    const local = inventory(env.LOCAL_DATABASE_URL, localSnapshot.id);
    for (const [label, url, snap] of [['production', env.PRODUCTION_DATABASE_URL, prodSnapshot], ['local', env.LOCAL_DATABASE_URL, localSnapshot]]) {
      write(`${label}-schema.sql`, run('pg_dump', ['--schema-only', '--no-owner', '--no-acl', `--snapshot=${snap.id}`], url));
    }
    prodSnapshot.close(); prodSnapshot = null;
    localSnapshot.close(); localSnapshot = null;
    run('pg_restore', ['--no-owner', '--no-acl', '--exit-on-error', archive], env.TEMP_RESTORE_DATABASE_URL);
    const restored = inventory(env.TEMP_RESTORE_DATABASE_URL);
    for (const key of Object.keys(prod)) {
      write(`production-${key}.txt`, prod[key]); write(`local-${key}.txt`, local[key]); write(`restored-${key}.txt`, restored[key]);
      if (prod[key] !== restored[key]) throw new Error(`Restore verification failed: ${key}`);
      const diff = spawnSync('diff', ['-u', path.join(dir, `local-${key}.txt`), path.join(dir, `production-${key}.txt`)], { encoding: 'utf8' });
      if (diff.error || ![0, 1].includes(diff.status)) throw new Error('Comparison failed');
      write(`${key}.diff`, diff.stdout);
    }
    const diff = spawnSync('diff', ['-u', path.join(dir, 'local-schema.sql'), path.join(dir, 'production-schema.sql')], { encoding: 'utf8' });
    if (diff.error || ![0, 1].includes(diff.status)) throw new Error('Schema comparison failed');
    write('schema.diff', diff.stdout);
    const seedFiles = path.join(repo, 'backend/prisma/seeds/production');
    const expected = fs.readdirSync(seedFiles).filter(f => f.endsWith('.seed.ts')).flatMap(f => [...fs.readFileSync(path.join(seedFiles, f), 'utf8').matchAll(/key:\s*['"]([^'"]+)['"]/g)].map(m => m[1]));
    write('seed-status.json', JSON.stringify({ expected, pending: expected.filter(k => !prod.seeds.trim().split('\n').includes(k)), unknown: prod.seeds.trim().split('\n').filter(k => k && !expected.includes(k)) }, null, 2));
    const migrationRoot = path.join(repo, 'backend/prisma/migrations');
    const migrationFiles = fs.readdirSync(migrationRoot).filter(f => fs.existsSync(path.join(migrationRoot, f, 'migration.sql')));
    const ledger = prod.migrations.trim().split('\n').filter(Boolean).map(line => line.split('\t'));
    const applied = ledger.filter(row => row[2] && !row[3]);
    write('migration-status.json', JSON.stringify({
      pending: migrationFiles.filter(f => !applied.some(row => row[0] === f)),
      unknown: applied.filter(row => !migrationFiles.includes(row[0])).map(row => row[0]),
      unresolved: ledger.filter(row => !row[2] && !row[3]).map(row => row[0]),
      checksumMismatch: applied.filter(row => migrationFiles.includes(row[0]) && crypto.createHash('sha256').update(fs.readFileSync(path.join(migrationRoot, row[0], 'migration.sql'))).digest('hex') !== row[1]).map(row => row[0]),
    }, null, 2));
    write('verified.json', JSON.stringify({ verifiedAt: new Date().toISOString(), revision: env.AUDITED_SHA || null, sha256: checksum, restoreVerified: true, comparisons: Object.fromEntries(Object.keys(prod).map(k => [k, prod[k] === local[k]])) }, null, 2));
    console.log(`Backup and snapshot-consistent restore verification PASS: ${dir}`);
  } finally {
    prodSnapshot?.close(); localSnapshot?.close();
    if (created) query(env.TEMP_RESTORE_ADMIN_URL, `DROP DATABASE ${quote(name)}`);
  }
}
module.exports = { validate };
if (require.main === module) main().catch(() => { console.error('Database backup gate FAILED. Private output withheld; production was not modified.'); process.exitCode = 1; });
