const { test } = require('node:test');
const assert = require('node:assert/strict');
const { requiredPackages } = require('../scripts/prepare-isolated-restore-extensions.cjs');

test('no provisioning when required extension version exists in restore service', () => {
  assert.deepEqual(requiredPackages([['pg_trgm','1.6']], [['pg_trgm','1.6']]), []);
});
test('allowlisted packages only and deduplicate packages', () => {
  assert.deepEqual(requiredPackages([['vector','0.8.0'],['postgis','3.5.2'],['postgis_topology','3.5.2']], []),
    ['postgresql-18-pgvector','postgresql-18-postgis-3']);
});
test('reject unknown extensions without arbitrary installation', () => {
  assert.throws(() => requiredPackages([['some_unknown_extension','1.0']], []), /UNSUPPORTED_RESTORE_EXTENSION/);
});
test('reject unsafe metadata', () => {
  assert.throws(() => requiredPackages([['pg_trgm; DROP DATABASE','1.6']], []), /Invalid source extension metadata/);
  assert.throws(() => requiredPackages([['pg_trgm','1.6;rm']], []), /Invalid source extension metadata/);
});
test('provision when same name but source version is missing', () => {
  assert.deepEqual(requiredPackages([['vector','0.8.0']], [['vector','0.7.4']]), ['postgresql-18-pgvector']);
});
