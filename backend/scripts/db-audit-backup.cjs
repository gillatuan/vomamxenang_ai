const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const readline = require('node:readline');
let phase = 'configuration';

function validate(env) {
  const productionOnly = env.BACKUP_MODE === 'production-only';
  const keys = ['PRODUCTION_DATABASE_URL', ...(productionOnly ? [] : ['LOCAL_DATABASE_URL']), 'TEMP_RESTORE_ADMIN_URL', 'TEMP_RESTORE_DATABASE_URL'];
  const urls = keys.map(key => {
    try {
      const u = new URL(env[key]);
      if (!['postgres:', 'postgresql:'].includes(u.protocol) || !u.hostname || !u.pathname.slice(1) || u.searchParams.has('host') || u.searchParams.has('hostaddr') || u.searchParams.has('dbname')) throw Error();
      return u;
    } catch { throw new Error(`Invalid direct PostgreSQL configuration: ${key}`); }
  });
  const connections = Object.fromEntries(keys.map((key, index) => [key, urls[index]]));
  const prod = connections.PRODUCTION_DATABASE_URL, local = connections.LOCAL_DATABASE_URL;
  const admin = connections.TEMP_RESTORE_ADMIN_URL, restore = connections.TEMP_RESTORE_DATABASE_URL;
  const db = u => decodeURIComponent(u.pathname.slice(1));
  const endpoint = u => `${u.hostname}:${u.port || '5432'}`;
  const name = db(restore);
  if (!/^vmx_restore_[a-z0-9_]+$/.test(name) || name === db(prod) || (local && name === db(local)) || name === db(admin)) throw new Error('Restore database must have a unique vmx_restore_ name');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(restore.hostname) || endpoint(admin) !== endpoint(restore)) throw new Error('Restore/admin must use the same isolated loopback PostgreSQL server');
  if (local && endpoint(prod) === endpoint(local) && db(prod) === db(local)) throw new Error('Production and local databases must differ');
  return { name };
}
function run(command, args, url, input) {
  const r = spawnSync(command, args, { env: pgEnv(url), input, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  // PostgreSQL errors may contain connection credentials or private row data.
  if (r.error || r.status !== 0) throw new Error(`POSTGRES_${classifyFailure(r.stderr || '')}`);
  return r.stdout;
}
function classifyFailure(stderr) {
  if (/server version mismatch|server version:.*pg_dump version|aborting because of server version/i.test(stderr)) return 'CLIENT_VERSION_MISMATCH';
  if (/invalid snapshot|snapshot.*does not exist|SET TRANSACTION SNAPSHOT/i.test(stderr)) return 'SNAPSHOT_IMPORT_FAILED';
  if (/password authentication failed|no password supplied|authentication failed/i.test(stderr)) return 'AUTHENTICATION_FAILED';
  if (/could not translate host name|name or service not known/i.test(stderr)) return 'DNS_FAILED';
  if (/connection refused|timeout expired|could not connect|network is unreachable|connection timed out/i.test(stderr)) return 'CONNECTION_FAILED';
  if (/SSL|certificate|TLS/i.test(stderr)) return 'TLS_FAILED';
  if (/permission denied|must be|insufficient privilege/i.test(stderr)) return 'PERMISSION_DENIED';
  if (/database .* does not exist/i.test(stderr)) return 'DATABASE_NOT_FOUND';
  return 'CLIENT_FAILED';
}
function safeFailure(error) {
  const message = error?.message || '';
  if (/^POSTGRES_(AUTHENTICATION_FAILED|DNS_FAILED|CONNECTION_FAILED|TLS_FAILED|PERMISSION_DENIED|DATABASE_NOT_FOUND|CLIENT_VERSION_MISMATCH|SNAPSHOT_IMPORT_FAILED|CLIENT_FAILED)$/.test(message)) return message;
  if (message === 'Production and local connections resolve to the same database' || message === 'Production and local databases must differ') return 'SOURCE_AND_REFERENCE_ARE_SAME_DATABASE';
  if (message === 'Unsupported PostgreSQL connection parameter') return 'UNSUPPORTED_CONNECTION_PARAMETER';
  if (message === 'Only public Prisma schema is supported') return 'UNSUPPORTED_SCHEMA';
  if (message.startsWith('Invalid direct PostgreSQL configuration: ')) return 'INVALID_DIRECT_POSTGRESQL_URL';
  return 'VERIFICATION_FAILED';
}
function pgEnv(value) {
  const env = { ...process.env };
  // Avoid inherited service/host defaults redirecting an explicitly selected DB.
  for (const key of Object.keys(env)) if (key.startsWith('PG')) delete env[key];
  if (!value) return env;
  const u = new URL(value);
  Object.assign(env, { PGHOST: u.hostname.replace(/^\[|\]$/g, ''), PGPORT: u.port || '5432', PGUSER: decodeURIComponent(u.username), PGPASSWORD: decodeURIComponent(u.password), PGDATABASE: decodeURIComponent(u.pathname.slice(1)), PGCONNECT_TIMEOUT: '15' });
  const options = { sslmode: 'PGSSLMODE', sslrootcert: 'PGSSLROOTCERT', sslcert: 'PGSSLCERT', sslkey: 'PGSSLKEY', sslpassword: 'PGSSLPASSWORD', channel_binding: 'PGCHANNELBINDING', target_session_attrs: 'PGTARGETSESSIONATTRS', gssencmode: 'PGGSSENCMODE', application_name: 'PGAPPNAME', connect_timeout: 'PGCONNECT_TIMEOUT' };
  for (const [key, value] of u.searchParams) {
    if (key === 'options') continue;
    if (key === 'schema') {
      if (value !== 'public') throw new Error('Only public Prisma schema is supported');
      continue;
    }
    if (['connection_limit', 'pool_timeout', 'pgbouncer', 'statement_cache_size', 'socket_timeout'].includes(key)) continue;
    if (!options[key]) throw new Error('Unsupported PostgreSQL connection parameter');
    env[options[key]] = value;
  }
  env.PGOPTIONS = `${u.searchParams.get('options') || ''} -c statement_timeout=600000 -c timezone=UTC`;
  return env;
}
const query = (url, sql) => run('psql', ['-XqAt', '-F', '\t', '-v', 'ON_ERROR_STOP=1'], url, sql);
const quote = value => '"' + value.replaceAll('"', '""') + '"';
async function snapshot(url) {
  const child = spawn('psql', ['-XqAt', '-v', 'ON_ERROR_STOP=1'], { env: pgEnv(url), stdio: ['pipe', 'pipe', 'ignore'] });
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
  const productionOnly = env.BACKUP_MODE === 'production-only';
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
    phase = 'database identity';
    const identitySql = 'SELECT inet_server_addr(), inet_server_port(), current_database()';
    phase = 'production connection identity';
    const productionIdentity = query(env.PRODUCTION_DATABASE_URL, identitySql);
    const serverVersion = query(env.PRODUCTION_DATABASE_URL, 'SHOW server_version_num').trim();
    if (/^\\d+$/.test(serverVersion)) console.log(`Production PostgreSQL major=${Math.floor(Number(serverVersion) / 10000)}`);
    console.log(run('pg_dump', ['--version']).trim());
    if (!productionOnly) {
      phase = 'reference connection identity';
      const localIdentity = query(env.LOCAL_DATABASE_URL, identitySql);
      phase = 'distinct database identity';
      if (productionIdentity === localIdentity) throw new Error('Production and local connections resolve to the same database');
    }
    // CREATE intentionally fails if the target already exists; never DROP an unowned DB.
    phase = 'isolated target creation';
    query(env.TEMP_RESTORE_ADMIN_URL, `CREATE DATABASE ${quote(name)} TEMPLATE template0`);
    created = true;
    phase = 'source snapshots';
    prodSnapshot = await snapshot(env.PRODUCTION_DATABASE_URL);
    localSnapshot = productionOnly ? null : await snapshot(env.LOCAL_DATABASE_URL);
    const archive = path.join(dir, 'production.dump');
    phase = 'archive dump';
    run('pg_dump', ['--format=custom', '--no-owner', '--no-acl', `--snapshot=${prodSnapshot.id}`, `--file=${archive}`], env.PRODUCTION_DATABASE_URL);
    if (!fs.statSync(archive).size) throw new Error('Empty backup');
    write('restore-toc.txt', run('pg_restore', ['--list', archive]));
    const digest = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(archive)) digest.update(chunk);
    const checksum = digest.digest('hex');
    write('production.dump.sha256', checksum + '  production.dump\n');
    phase = 'source inventory';
    const prod = inventory(env.PRODUCTION_DATABASE_URL, prodSnapshot.id);
    const local = localSnapshot ? inventory(env.LOCAL_DATABASE_URL, localSnapshot.id) : null;
    for (const [label, url, snap] of [['production', env.PRODUCTION_DATABASE_URL, prodSnapshot], ...(localSnapshot ? [['local', env.LOCAL_DATABASE_URL, localSnapshot]] : [])]) {
      write(`${label}-schema.sql`, run('pg_dump', ['--schema-only', '--no-owner', '--no-acl', `--snapshot=${snap.id}`], url));
    }
    prodSnapshot.close(); prodSnapshot = null;
    localSnapshot?.close(); localSnapshot = null;
    phase = 'isolated restore';
    // pg_restore requires -d to execute a restore; credentials stay in env.
    run('pg_restore', ['--dbname', name, '--no-owner', '--no-acl', '--exit-on-error', archive], env.TEMP_RESTORE_DATABASE_URL);
    phase = 'restore inventory verification';
    const restored = inventory(env.TEMP_RESTORE_DATABASE_URL);
    for (const key of Object.keys(prod)) {
      write(`production-${key}.txt`, prod[key]); if (local) write(`local-${key}.txt`, local[key]); write(`restored-${key}.txt`, restored[key]);
      if (prod[key] !== restored[key]) throw new Error(`Restore verification failed: ${key}`);
      if (!local) continue;
      const diff = spawnSync('diff', ['-u', path.join(dir, `local-${key}.txt`), path.join(dir, `production-${key}.txt`)], { encoding: 'utf8' });
      if (diff.error || ![0, 1].includes(diff.status)) throw new Error('Comparison failed');
      write(`${key}.diff`, diff.stdout);
    }
    if (local) {
      const diff = spawnSync('diff', ['-u', path.join(dir, 'local-schema.sql'), path.join(dir, 'production-schema.sql')], { encoding: 'utf8' });
      if (diff.error || ![0, 1].includes(diff.status)) throw new Error('Schema comparison failed');
      write('schema.diff', diff.stdout);
    }
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
    write('verified.json', JSON.stringify({ verifiedAt: new Date().toISOString(), revision: env.AUDITED_SHA || null, sha256: checksum, restoreVerified: true, localComparison: local ? 'completed' : 'not-run', comparisons: local ? Object.fromEntries(Object.keys(prod).map(k => [k, prod[k] === local[k]])) : null }, null, 2));
    console.log(`Backup and snapshot-consistent restore verification PASS: ${dir}`);
  } finally {
    prodSnapshot?.close(); localSnapshot?.close();
    if (created) query(env.TEMP_RESTORE_ADMIN_URL, `DROP DATABASE ${quote(name)}`);
  }
}
module.exports = { validate, pgEnv, classifyFailure, safeFailure };
if (require.main === module) main().catch(error => { console.error(`Database backup gate FAILED at ${phase}; reason=${safeFailure(error)}. Private output withheld; production was not modified.`); process.exitCode = 1; });
