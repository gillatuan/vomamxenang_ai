const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate, pgEnv, classifyFailure, safeFailure } = require('../scripts/db-audit-backup.cjs');
const config = () => ({ PRODUCTION_DATABASE_URL: 'postgresql://p@remote/prod', LOCAL_DATABASE_URL: 'postgres://l@localhost/local', TEMP_RESTORE_ADMIN_URL: 'postgresql://a@localhost/postgres', TEMP_RESTORE_DATABASE_URL: 'postgresql://a@localhost/vmx_restore_test' });
test('accept isolated restore', () => assert.equal(validate(config()).name, 'vmx_restore_test'));
test('reject unsafe targets and alternate connection parameters', () => {
  for (const target of ['postgresql://other@localhost/prod', 'postgresql://a@remote/vmx_restore_test', 'postgresql://a@localhost/vmx_restore_test?host=remote', 'postgresql://a@localhost/vmx_restore_test?dbname=prod', 'prisma+postgres://a@localhost/vmx_restore_test']) {
    assert.throws(() => validate({ ...config(), TEMP_RESTORE_DATABASE_URL: target }));
  }
});
test('reject same production/local despite differing user and protocol', () => assert.throws(() => validate({ ...config(), PRODUCTION_DATABASE_URL: 'postgresql://p@localhost/local' })));
test('reject mismatched admin server or admin database', () => {
  for (const target of ['postgresql://a@remote/postgres', 'postgresql://a@localhost/vmx_restore_test']) assert.throws(() => validate({ ...config(), TEMP_RESTORE_ADMIN_URL: target }));
});
test('map URI connection options into libpq environment without credentials in argv', () => {
  const env = pgEnv('postgresql://user:p%40ss@db.example:6543/app?sslmode=require&channel_binding=require');
  assert.equal(env.PGHOST, 'db.example');
  assert.equal(env.PGPORT, '6543');
  assert.equal(env.PGUSER, 'user');
  assert.equal(env.PGPASSWORD, 'p@ss');
  assert.equal(env.PGDATABASE, 'app');
  assert.equal(env.PGSSLMODE, 'require');
  assert.equal(env.PGCHANNELBINDING, 'require');
  assert.equal(env.PGSERVICE, undefined);
});

test('Prisma client-only URL options do not prevent direct PostgreSQL tools', () => {
  const env = pgEnv('postgresql://u:p@db/app?schema=public&sslmode=require&connection_limit=5&pool_timeout=10');
  assert.equal(env.PGDATABASE, 'app');
  assert.equal(env.PGSSLMODE, 'require');
  assert.throws(() => pgEnv('postgresql://u:p@db/app?schema=private'));
});
test('diagnostics classify errors without revealing secrets', () => {
  assert.equal(classifyFailure('password authentication failed for user secret-user'), 'AUTHENTICATION_FAILED');
  assert.equal(classifyFailure('could not translate host name secret-host'), 'DNS_FAILED');
  assert.equal(classifyFailure('connection refused at private-host'), 'CONNECTION_FAILED');
  assert.equal(safeFailure(new Error('Production and local connections resolve to the same database')), 'SOURCE_AND_REFERENCE_ARE_SAME_DATABASE');
  assert.equal(safeFailure(new Error('postgresql://user:secret@host/db')), 'VERIFICATION_FAILED');
});


test('production-only mode permits absent reference without relaxing restore isolation', () => {
  const env = { ...config(), BACKUP_MODE: 'production-only', LOCAL_DATABASE_URL: '' };
  assert.equal(validate(env).name, 'vmx_restore_test');
  assert.throws(() => validate({ ...env, TEMP_RESTORE_DATABASE_URL: 'postgresql://a@localhost/prod' }));
  assert.throws(() => validate({ ...env, BACKUP_MODE: undefined }));
});

test('classifies restore problems without leaking PostgreSQL output', () => {
  const cases = [
    ['pg_restore: error: could not execute query: ERROR: extension "postgis" is not available', 'MISSING_EXTENSION'],
    ['pg_restore: error: could not execute query: ERROR: role "secret_role" does not exist', 'MISSING_ROLE'],
    ['pg_restore: error: could not execute query: ERROR: permission denied for schema public', 'PERMISSION_DENIED'],
    ['pg_restore: error: could not execute query: ERROR: no space left on device', 'RESOURCE_DISK_FULL'],
    ['pg_restore: error: could not execute query: ERROR: out of shared memory', 'RESOURCE_SHARED_MEMORY'],
    ['pg_restore: error: could not execute query: ERROR: syntax error at or near "secret"', 'SQL_COMPATIBILITY'],
    ['pg_restore: error: could not execute query: ERROR: type "secret" does not exist', 'MISSING_DATABASE_OBJECT'],
    ['pg_restore: error: could not execute query: ERROR: confidential row text', 'RESTORE_SQL_FAILED'],
  ];
  for (const [stderr, code] of cases) {
    assert.equal(classifyFailure(stderr), code);
    assert.equal(safeFailure(new Error('POSTGRES_' + code)), 'POSTGRES_' + code);
    assert.ok(!safeFailure(new Error('POSTGRES_' + code)).includes('secret'));
  }
  assert.equal(classifyFailure('', { code: 'ENOENT' }), 'CLIENT_NOT_INSTALLED');
  assert.equal(classifyFailure('', { code: 'ENOBUFS' }), 'CLIENT_OUTPUT_TOO_LARGE');
  assert.equal(classifyFailure('confidential text'), 'CLIENT_FAILED');
  assert.equal(safeFailure(new Error('pg_restore: password=very-secret')), 'VERIFICATION_FAILED');
});
