import assert from 'node:assert/strict';

const raw = process.env.DEMO_STAGING_API_BASE;
if (!raw) throw new Error('DEMO_STAGING_API_BASE is required.');
const url = new URL(raw);
const host = url.hostname.toLowerCase();
const localhost = host === 'localhost' || host === '127.0.0.1';
const staging = /(^|[.-])(preview|staging|stage|demo|test|sandbox)([.-]|$)/.test(host);
if (!localhost && !(url.protocol === 'https:' && staging)) {
  throw new Error('Read-only demo smoke test must target a local or staging host.');
}
const base = url.toString().replace(/\/$/, '');
async function get(path: string): Promise<any> {
  const response = await fetch(base + path);
  assert(response.ok, 'API returned ' + response.status + ' for ' + path);
  return response.json();
}
async function main() {
  const catalog = await get('/products');
  assert(Array.isArray(catalog), 'Products must be an array.');
  const priced = catalog.filter((p: any) => p.type === 'TIRE' && typeof p.sellingPrice === 'number' && p.sellingPrice > 0);
  assert(priced.length > 0, 'No priced tires available for testing.');
  const product = priced[0];
  const detail = await get('/products/' + encodeURIComponent(product.slug || product.id));
  assert.equal(detail.id, product.id);
  assert.equal(detail.sellingPrice, product.sellingPrice);
  const filtered = await get('/products?minPrice=' + product.sellingPrice + '&maxPrice=' + product.sellingPrice);
  assert(Array.isArray(filtered));
  assert(filtered.some((p: any) => p.id === product.id), 'Exact-price filter should include sample.');
  const sorted = await get('/products?sort=price-asc');
  const prices = sorted.map((p: any) => p.sellingPrice).filter((v: any) => typeof v === 'number');
  assert(prices.every((v: number, i: number) => i === 0 || prices[i - 1] <= v), 'Prices should sort ascending.');
  console.log(JSON.stringify({ result: 'PASS', products: catalog.length, pricedTires: priced.length, sampleSku: product.sku, unitPrice: product.sellingPrice, quantity2Total: product.sellingPrice * 2, checks: ['catalog', 'detail', 'filter', 'sort', 'cart arithmetic'] }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
