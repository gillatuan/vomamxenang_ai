const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../scripts/db-audit-backup.cjs');
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
