const ts = require('typescript');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { canonicalSiteUrl } = require('../src/lib/site-config.ts');
test('canonical URLs use the served production hostname and preserve local origin', () => {
  assert.equal(canonicalSiteUrl('https://vomamxenang.com/'), 'https://www.vomamxenang.com');
  assert.equal(canonicalSiteUrl('http://www.vomamxenang.com'), 'https://www.vomamxenang.com');
  assert.equal(canonicalSiteUrl('http://localhost:3000/'), 'http://localhost:3000');
});
