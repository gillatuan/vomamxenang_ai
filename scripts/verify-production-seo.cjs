#!/usr/bin/env node
'use strict';
// Read-only production smoke checker. Accepts downloaded HTTP bodies, never
// imports DB credentials or posts to production.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const [robotsPath, sitemapPath, productPath, productUrl] = process.argv.slice(2);
if (!robotsPath || !sitemapPath || !productPath || !productUrl) {
  console.error('Usage: node scripts/verify-production-seo.cjs robots.txt sitemap.xml product.html product-url');
  process.exit(2);
}
const robots = fs.readFileSync(robotsPath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const html = fs.readFileSync(productPath, 'utf8');
const canonicalHost = 'https://www.vomamxenang.com';
const normalized = new URL(productUrl);
assert.equal(normalized.origin, canonicalHost, 'Product URL must use production canonical domain');
assert.match(robots, /User-agent:\s*\*/i, 'robots.txt missing user agent');
assert.match(robots, /Sitemap:\s*https:\/\/www\.vomamxenang\.com\/sitemap\.xml/i, 'robots.txt missing sitemap reference');
assert.match(sitemap, /<urlset\b/i, 'sitemap.xml missing XML urlset');
assert(sitemap.includes('<loc>https://www.vomamxenang.com/products</loc>'), 'sitemap missing product listing');
assert(sitemap.includes('<loc>' + productUrl + '</loc>'), 'sitemap missing current published product URL');
assert(!sitemap.includes('/admin/'), 'sitemap should not contain admin routes');
assert(/<title(?:\s[^>]*)?>[^<]+<\/title>/i.test(html), 'Product page missing title');
assert(/<meta\s+[^>]*name=["']description["'][^>]*>/i.test(html), 'Product meta description missing');
const canonicalTag = (html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
assert(canonicalTag, 'Product canonical tag missing');
assert(canonicalTag.includes(productUrl), 'Product canonical URL mismatch');
assert(!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), 'Product page marked noindex');
assert(/application\/ld\+json/i.test(html), 'Product structured data script missing');
assert(html.includes('"@type":"Product"') || /"@type"\s*:\s*"Product"/.test(html), 'Product structured data not present');
console.log(JSON.stringify({
  status: 'PASS',
  checks: ['robots', 'sitemap', 'product-sitemap-inclusion', 'title', 'description', 'canonical', 'indexable', 'product-jsonld'],
  productUrl,
}, null, 2));
