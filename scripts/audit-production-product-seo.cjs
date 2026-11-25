#!/usr/bin/env node
'use strict';
// Read-only audit of every product URL advertised by production sitemap.
// No credentials, API POST, database mutation or deployment.
const fs = require('node:fs');
const { createHash } = require('node:crypto');

const BASE = 'https://www.vomamxenang.com';
const SITEMAP = BASE + '/sitemap.xml';
const MAX = 250; // guard against an unexpectedly large sitemap
const concurrency = 3;
const timeoutMs = 30000;

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>\s*(https:\/\/www\.vomamxenang\.com\/products\/[^<\s]+)\s*<\/loc>/gi)]
    .map(x => x[1].replace(/&amp;/g, '&'));
}
function attrs(tag) {
  const result = {};
  for (const [, key, , quoted] of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gis)) result[key.toLowerCase()] = quoted;
  return result;
}
function tags(html, name) {
  return [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map(x => ({ raw: x[0], attr: attrs(x[0]) }));
}
function metaContent(html, key) {
  const item = tags(html, 'meta').find(m => m.attr.name?.toLowerCase() === key);
  return item?.attr.content?.trim() || '';
}
function parseProductJsonLd(html) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/application\/ld\+json/i.test(match[1])) continue;
    let parsed;
    try { parsed = JSON.parse(match[2]); } catch { continue; }
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (item && item['@type'] === 'Product') return item;
      for (const nested of item?.['@graph'] || []) if (nested['@type'] === 'Product') return nested;
    }
  }
  return null;
}
async function fetchText(url) {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    headers: { 'User-Agent': 'Vomamxenang-Production-SEO-ReadOnly-Audit/1.0' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw Error('HTTP ' + response.status);
  return { text: await response.text(), headers: response.headers, finalUrl: response.url };
}
function inspect(url, page) {
  const { text: html, headers, finalUrl } = page;
  const problems = [], warnings = [];
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = metaContent(html, 'description');
  const canonical = tags(html, 'link').find(link => link.attr.rel?.toLowerCase() === 'canonical')?.attr.href || '';
  const robots = metaContent(html, 'robots');
  const xRobots = headers.get('x-robots-tag') || '';
  const product = parseProductJsonLd(html);
  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  if (finalUrl !== url) problems.push('Unexpected HTTP redirect: ' + finalUrl);
  if (!title || title.length < 12) problems.push('Missing/very short <title>');
  if (!description || description.length < 45) problems.push('Missing/very short meta description');
  if (canonical !== url) problems.push('Canonical mismatch: ' + canonical);
  if (/noindex/i.test(robots + ' ' + xRobots)) problems.push('Meta/X-Robots noindex');
  if (!product) problems.push('Missing parseable Product JSON-LD');
  else {
    if (product.url !== url) problems.push('Product JSON-LD URL mismatch');
    if (!product.name) problems.push('Product JSON-LD name missing');
    if (product.offers?.price && product.offers?.priceCurrency !== 'VND') problems.push('Incorrect currency');
    if (!product.image) warnings.push('No real product image in structured data');
  }
  if (!heading) problems.push('No rendered <h1>');
  if (description.length > 160) warnings.push('Long meta description');
  if (title.length > 75) warnings.push('Long title');
  if (heading && /<[^>]+>/.test(heading)) warnings.push('Unexpected heading markup');
  return { url, title, description, canonical, productSku: product?.sku || null,
    productImage: !!product?.image, problems, warnings,
    descriptionHash: createHash('sha256').update(description.toLowerCase()).digest('hex').slice(0,12) };
}
async function main() {
  const { text: xml } = await fetchText(SITEMAP);
  if (!/<urlset\b/i.test(xml)) throw Error('Invalid sitemap XML root');
  const urls = urlsFromSitemap(xml);
  if (!urls.length) throw Error('Sitemap has no product detail URLs');
  if (urls.length > MAX) throw Error('Unexpected product URL count: ' + urls.length);
  if (new Set(urls).size !== urls.length) throw Error('Duplicate product URLs in sitemap');
  const results = new Array(urls.length);
  let index = 0;
  async function worker() {
    while (index < urls.length) {
      const i = index++;
      try { results[i] = inspect(urls[i], await fetchText(urls[i])); }
      catch (error) {
        results[i] = { url: urls[i], title: '', description: '', canonical: '',
          productSku: null, productImage: false, problems: [String(error.message || error)], warnings: [] };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  const seenTitles = new Map(), seenDescriptions = new Map();
  for (const entry of results) {
    const t = entry.title.trim().toLocaleLowerCase('vi');
    const d = entry.description.trim().toLocaleLowerCase('vi');
    if (t) {
      if (seenTitles.has(t)) entry.problems.push('Duplicate SEO title with ' + seenTitles.get(t));
      else seenTitles.set(t, entry.url);
    }
    if (d) {
      if (seenDescriptions.has(d)) entry.problems.push('Duplicate meta description with ' + seenDescriptions.get(d));
      else seenDescriptions.set(d, entry.url);
    }
  }
  const stats = {
    pages: results.length,
    passed: results.filter(x => !x.problems.length).length,
    failed: results.filter(x => x.problems.length).length,
    withoutRealImageInSchema: results.filter(x => !x.productImage).length,
    warningCount: results.reduce((sum,x) => sum + x.warnings.length,0),
  };
  const report = { status: stats.failed ? 'FAIL' : 'PASS', generatedAt: new Date().toISOString(), stats, results };
  if (process.env.SEO_AUDIT_REPORT_PATH) fs.writeFileSync(process.env.SEO_AUDIT_REPORT_PATH, JSON.stringify(report,null,2));
  console.log(JSON.stringify({ status: report.status, ...stats },null,2));
  for (const item of results.filter(x => x.problems.length || x.warnings.length)) {
    console.log(item.url);
    for (const reason of item.problems) console.log('  ERROR ' + reason);
    for (const warning of item.warnings) console.log('  WARN ' + warning);
  }
  if (stats.failed) process.exitCode = 1;
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { urlsFromSitemap, attrs, metaContent, parseProductJsonLd, inspect };
