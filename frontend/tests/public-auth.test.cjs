const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function fail401(pathname) {
  let onError;
  const removed = [];
  const window = { location: { pathname, href: pathname } };
  const client = { interceptors: { request: { use() {} }, response: { use(_ok, error) { onError = error; } } } };
  const source = fs.readFileSync(path.join(__dirname, '../src/lib/api.ts'), 'utf8').replace('import axios from "axios";', '').replace('export const apiClient', 'const apiClient').replace('export default apiClient;', '');
  const context = { axios: { create: () => client }, process: { env: {} }, window, localStorage: { removeItem: key => removed.push(key) }, document: {} };
  vm.runInNewContext(source, context);
  const error = { response: { status: 401 } };
  return onError(error).catch(actual => { assert.equal(actual, error); return { window, removed }; });
}
test('401 leaves public catalog, case pages and similarly named routes accessible', async () => {
  for (const route of ['/products', '/products/tire', '/cong-viec-da-lam', '/', '/administrator', '/dashboard-public', '/auth/login']) {
    const { window } = await fail401(route);
    assert.equal(window.location.href, route);
  }
});
test('401 still redirects protected pages and clears expired credentials', async () => {
  for (const route of ['/admin', '/admin/products', '/dashboard', '/dashboard/orders']) {
    const { window, removed } = await fail401(route);
    assert.equal(window.location.href, '/admin/login');
    assert.deepEqual(removed, ['token', 'user']);
  }
});
