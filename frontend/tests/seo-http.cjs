// Run explicitly while the frontend and backend local servers are running.
const assert = require('node:assert/strict');
(async () => {
  for (const [api, route] of [['products', 'products'], ['posts', 'blog']]) {
    const rows = await (await fetch(`http://localhost:3001/api/v1/${api}`)).json();
    const item = rows.find(item => (item.description || item.content || '').includes('<a ')) || rows[0];
    assert.ok(item, `A published ${api} fixture is required`);
    const old = await fetch(`http://localhost:3000/${route}/${item.id}`, { redirect: 'manual' });
    assert.equal(old.status, 308);
    assert.equal(old.headers.get('location'), `/${route}/${item.slug}`);
    const page = await fetch(`http://localhost:3000/${route}/${item.slug}`);
    const html = await page.text();
    assert.equal(page.status, 200);
    for (const marker of ['rel="canonical"', 'application/ld+json', '<h1', item.name || item.title]) assert.ok(html.includes(marker), marker);
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.ok(body.includes('href="/products/') || body.includes('href="/blog/'));
    const missing = await fetch(`http://localhost:3000/${route}/no-such-content-seo-test`);
    assert.equal(missing.status, 404);
    console.log(`${route}: 308 redirect, server HTML, metadata, links and 404 passed`);
  }
  const sitemap = await (await fetch('http://localhost:3000/sitemap.xml')).text();
  assert.ok(sitemap.includes('/products/lop-'));
  console.log('Sitemap aliases passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
