'use strict';
const { spawnSync } = require('node:child_process');
const { pgEnv } = require('./db-audit-backup.cjs');

// Only install these trusted, distribution-packaged extensions in the throwaway
// restore service. Never install arbitrary SQL, extensions, or packages from DB.
const PACKAGES = Object.freeze({
  vector: 'postgresql-18-pgvector',
  postgis: 'postgresql-18-postgis-3',
  postgis_topology: 'postgresql-18-postgis-3',
  postgis_tiger_geocoder: 'postgresql-18-postgis-3',
  pg_partman: 'postgresql-18-partman',
  hstore: 'postgresql-contrib',
  citext: 'postgresql-contrib',
  pgcrypto: 'postgresql-contrib',
  'uuid-ossp': 'postgresql-contrib',
  pg_trgm: 'postgresql-contrib',
  unaccent: 'postgresql-contrib',
  btree_gist: 'postgresql-contrib',
  btree_gin: 'postgresql-contrib',
  fuzzystrmatch: 'postgresql-contrib',
});
const NAME = /^[a-z][a-z0-9_-]{0,62}$/;
const VERSION = /^[a-zA-Z0-9._-]{1,64}$/;
function requiredPackages(source, available) {
  const missing = source.filter(([name, version]) => {
    if (!NAME.test(name) || !VERSION.test(version)) throw new Error('Invalid source extension metadata');
    return !available.some(([target, candidate]) => target === name && candidate === version);
  });
  const unsupported = missing.filter(([name]) => !PACKAGES[name]);
  if (unsupported.length) {
    const names = unsupported.map(([name]) => name).join(', ');
    throw new Error('UNSUPPORTED_RESTORE_EXTENSION: ' + names +
      ' (do not bypass verification; review a supported isolated restore image)');
  }
  return [...new Set(missing.map(([name]) => PACKAGES[name]))];
}
function query(url, sql) {
  const proc = spawnSync('psql', ['-XAt', '-F', '\t', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    encoding: 'utf8', env: pgEnv(url), maxBuffer: 1024 * 1024,
  });
  if (proc.error || proc.status !== 0) throw new Error('Failed to query PostgreSQL extension metadata');
  return proc.stdout.trim().split('\n').filter(Boolean).map(line => line.split('\t'));
}
function command(bin, args) {
  const run = spawnSync(bin, args, { stdio: 'ignore', maxBuffer: 1024 * 1024 });
  if (run.error || run.status !== 0) throw new Error('Restore extension package provisioning failed');
}
function main() {
  const source = process.env.PRODUCTION_DATABASE_URL;
  const local = process.env.TEMP_RESTORE_ADMIN_URL;
  const container = process.env.RESTORE_POSTGRES_CONTAINER;
  if (!source || !local || !/^[a-f0-9]{12,64}$/i.test(container || ''))
    throw new Error('Restore preparation requires approved database and service container');
  const sourceExtensions = query(source,
    "SELECT extname, extversion FROM pg_extension WHERE extname <> 'plpgsql' ORDER BY extname");
  const available = query(local,
    "SELECT name, version FROM pg_available_extension_versions ORDER BY name, version");
  const packages = requiredPackages(sourceExtensions, available);
  if (packages.length) {
    console.log('Provisioning approved extension packages on isolated PostgreSQL 18 service.');
    command('docker', ['exec', '-u', 'root', container, 'apt-get', 'update', '-qq']);
    command('docker', ['exec', '-u', 'root', container, 'apt-get', 'install', '-y', '-qq', ...packages]);
  } else {
    console.log('Isolated PostgreSQL already supports the required extension versions.');
  }
  const after = query(local,
    "SELECT name, version FROM pg_available_extension_versions ORDER BY name, version");
  const remaining = sourceExtensions.filter(([name, version]) =>
    !after.some(([target, candidate]) => target === name && candidate === version));
  if (remaining.length) throw new Error('ISOLATED_RESTORE_EXTENSION_VERSION_UNAVAILABLE: ' +
    remaining.map(([name, version]) => name + '@' + version).join(', '));
  console.log('Production extension versions are available for isolated restore.');
}
module.exports = { requiredPackages };
if (require.main === module) {
  try { main(); } catch (error) {
    // These messages contain only extension metadata, not database credentials or SQL.
    console.error('[RESTORE EXTENSION PREFLIGHT] ' + error.message);
    process.exitCode = 1;
  }
}
