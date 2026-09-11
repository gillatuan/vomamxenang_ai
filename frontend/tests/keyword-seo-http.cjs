// Run against a built app: SEO_TEST_ORIGIN=http://localhost:3100 node tests/keyword-seo-http.cjs
const assert = require('node:assert/strict');
const origin = process.env.SEO_TEST_ORIGIN || 'http://localhost:3100';
const publicOrigin = process.env.SEO_TEST_CANONICAL_ORIGIN || 'https://www.vomamxenang.com';
const schemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));
(async () => {
  const sitemapResponse = await fetch(origin + '/sitemap.xml');
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]));
  assert.equal(new Set(urls.map(u => u.href)).size, urls.length);
  for (const path of ['/vo-xe-nang','/lop-dac-xe-nang','/mam-xe-nang','/mam-xe-nang/rim-1']) assert.ok(urls.some(u => u.pathname === path), path);
  const pages = new Map();
  for (const url of urls) {
    assert.equal(url.origin, publicOrigin);
    const response = await fetch(origin + url.pathname);
    assert.equal(response.status, 200, url.pathname);
    const html = await response.text(); pages.set(url.pathname, html);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, url.pathname + ' H1');
    assert.ok(html.includes('rel="canonical" href="' + url.href + '"') || html.includes('rel="canonical" href="' + url.href.replace(/\/$/, '') + '"'), url.pathname + ' canonical');
    assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/);
    schemas(html); // Every JSON-LD block must parse.
  }
  const checked = new Set(pages.keys());
  for (const [path, html] of pages) {
    const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    for (const match of body.matchAll(/href="(\/[^"?#]*)[^"]*"/g)) {
      const href = match[1];
      if (checked.has(href) || !/^\/(blog|products|vo-xe-nang|lop-dac-xe-nang|mam-xe-nang)(\/|$)/.test(href)) continue;
      checked.add(href); const response = await fetch(origin + href);
      assert.equal(response.status, 200, path + ' broken link ' + href);
    }
  }
  for (const path of ['/products?size=6.00-9','/blog?q=lop','/vo-xe-nang?brand=NEXEN','/mam-xe-nang?sort=price']) {
    const html = await (await fetch(origin + path)).text();
    assert.match(html, /name="robots" content="noindex, follow"/);
    assert.ok(html.includes('rel="canonical" href="' + publicOrigin + path.split('?')[0] + '"'));
  }
  for (const path of ['/vo-xe-nang','/lop-dac-xe-nang','/mam-xe-nang']) {
    const html = pages.get(path); const data = schemas(html);
    assert.ok(data.some(s => s['@type'] === 'CollectionPage'));
    const crumb = data.find(s => s['@type'] === 'BreadcrumbList'); assert.ok(crumb);
    assert.ok(html.includes('aria-label="Đường dẫn"'));
    for (const item of crumb.itemListElement) assert.ok(html.includes(item.name));
    assert.equal((html.match(/<details/g) || []).length, 3);
  }
  const rim = schemas(pages.get('/mam-xe-nang/rim-1')).find(s => s['@type'] === 'Product');
  assert.ok(rim); assert.equal(rim.offers?.availability, undefined); assert.equal(rim.aggregateRating, undefined);
  assert.equal((await fetch(origin + '/mam-xe-nang/no-such-rim')).status, 404);
  const robots = await (await fetch(origin + '/robots.txt')).text();
  assert.ok(robots.includes('Disallow: /admin')); assert.doesNotMatch(robots, /Disallow:.*_next/);
  assert.ok(robots.includes(publicOrigin + '/sitemap.xml'));
  console.log(JSON.stringify({ pages: pages.size, internalTargetsChecked: checked.size, result: 'PASS: status, canonical, H1, JSON-LD, category FAQs, internal links, filters, rim 404, robots' }));
})().catch(error => { console.error(error); process.exitCode = 1; });
