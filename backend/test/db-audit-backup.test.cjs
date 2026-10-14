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
