import 'reflect-metadata';
import assert from 'node:assert/strict';
import { analyzePage, Content, keywordMap, pagePath, recommendations, SITE } from '../src/seo/seo-analysis';
import { isPublicAddress, publicUrl } from '../src/seo/public-fetch';
import { allowedTransition, evidenceAnalysis, opportunityUrl, BacklinkResearchService } from '../src/seo/backlink-research.service';
import { initialOpportunities, seoOpportunitiesSeed } from '../prisma/seeds/production/009-seo-opportunities.seed';
const product: Content = { id: 'p', kind: 'PRODUCT', path: '/products/real', title: 'Lốp đặc 6.00-9', size: '6.00-9', tireType: 'SOLID', brand: 'NEXEN', content: '<p>Lốp đặc xe nâng</p>', tags: ['lốp đặc xe nâng'], seo: {} };
const post: Content = { id: 'b', kind: 'POST', path: '/blog/guide', title: 'Chọn lốp đặc', content: '<p>Hướng dẫn lốp đặc xe nâng 6.00-9 NEXEN</p>', tags: ['lốp đặc xe nâng'], seo: {} };
async function main() {
  for (const ip of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '0.0.0.0', '192.168.1.1', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1', '100.64.0.1']) assert.equal(isPublicAddress(ip), false, ip);
  assert.equal(isPublicAddress('8.8.8.8'), true); assert.throws(() => publicUrl('file:///etc/passwd')); assert.throws(() => publicUrl('https://user:pass@example.com')); assert.throws(() => publicUrl('https://example.com:3001'));
  assert.deepEqual(opportunityUrl('https://www.example.com/a/?utm_source=x#hash'), { domain: 'example.com', url: 'https://www.example.com/a' });
  assert.equal(pagePath('https://vomamxenang.com/products/real?x=y#z'), product.path); assert.equal(pagePath('https://vomamxenang.com.evil.test/products/real'), null);
  const suggestions = recommendations([product, post]); assert(suggestions.some(s => s.sourceType === 'POST' && s.targetType === 'PRODUCT')); assert(suggestions.every(s => s.sourceId !== s.targetId));
  const linked = { ...post, content: '<a href="/products/real">Sản phẩm</a>' }; assert(!recommendations([product, linked]).some(s => s.sourceId === 'b' && s.targetId === 'p'));
  const unrelated = { ...product, id: 'other', path: '/products/other', size: '9.99-99', brand: 'OTHER', tireType: 'OTHER', tags: [], content: '' }; assert(!recommendations([product, unrelated]).length);
  const map = keywordMap([product, post]); assert(map.some(m => m.keyword === 'lốp xe nâng 6.00-9')); assert(!map.some(m => m.keyword.includes('6.50-10'))); assert.equal(map[0].primaryUrl, SITE + '/products');
  const page = analyzePage(product.path, { url: SITE + product.path, status: 200, headers: {}, html: '<title>One</title><h1>One</h1><h1>Two</h1><img src="x"><meta name="robots" content="noindex"><script type="application/ld+json">broken</script>' }, product);
  for (const code of ['MULTIPLE_H1', 'MISSING_META', 'NOINDEX', 'INVALID_JSONLD', 'MISSING_IMAGE_ALT', 'CANONICAL_PROBLEM', 'MISSING_PRIMARY_KEYWORD']) assert(page.issues.some(i => i.code === code), code);
  assert.equal(allowedTransition('DISCOVERED', 'LIVE'), false); assert.equal(allowedTransition('DISCOVERED', 'CONTACTED'), false); assert.equal(allowedTransition('APPROVED', 'CONTACTED'), true);
  assert.equal(evidenceAnalysis('forklift warehouse Vietnam casino', 'https://example.com').risk, 'HIGH'); assert.equal(evidenceAnalysis('forklift warehouse', 'https://example.com').relevanceScore, 75);
  let called = false;
  const service = new BacklinkResearchService({ backlinkOpportunity: { findUnique: async () => ({ id: 'x', status: 'DISCOVERED' }) } } as never, { generateStructuredOutput: async () => { called = true; } } as never, {} as never);
  await assert.rejects(service.outreach('x')); assert.equal(called, false, 'Unapproved opportunity cannot invoke AI');
  const identities = new Set(initialOpportunities.map(x => x.domain + x.url)); assert.equal(identities.size, 10); assert(initialOpportunities.every(x => x.evidence && x.url.startsWith('https://')));
  const stored: unknown[] = []; await seoOpportunitiesSeed.run({ backlinkOpportunity: { upsert: async args => stored.push(args) } } as never); assert.equal(stored.length, 10);
  console.log('SEO tests passed: audit evidence, link relevance, keyword provenance, SSRF guards, deduplication, workflow and immutable seed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

// Fetch injection exercises verifier state without contacting third-party sites.
async function verifierChecks() {
  let saved: Record<string, unknown> = {}; let status = 'APPROVED';
  const row = { id: 'opp', domain: 'publisher.example', suggestedTargetUrl: SITE + '/products/real', status: 'APPROVED' };
  const db = { backlinkOpportunity: { findUnique: async () => row, update: async (args: { data: { status: string } }) => { status = args.data.status; } }, backlink: { findUnique: async () => null, upsert: async (args: { create: Record<string, unknown> }) => { saved = args.create; return saved; }, count: async () => saved.isLive ? 1 : 0 }, $transaction: async (callback: (tx: unknown) => unknown) => callback(db) };
  let sourceFinal = 'https://publisher.example/story'; let targetFinal = row.suggestedTargetUrl;
  const fakeFetch = async (url: string) => ({ url: url.includes('publisher') ? sourceFinal : targetFinal, status: 200, headers: {}, html: `<a href="${row.suggestedTargetUrl}" rel="ugc nofollow">Real anchor</a>` });
  const service = new BacklinkResearchService(db as never, {} as never, {} as never, fakeFetch);
  await service.verify('opp', 'https://publisher.example/story'); assert.equal(saved.isLive, true); assert.equal(saved.rel, 'ugc nofollow'); assert.equal(status, 'LIVE');
  sourceFinal = SITE + '/copied-page'; await service.verify('opp', 'https://publisher.example/story'); assert.equal(saved.isLive, false, 'Redirect onto our own site is not an external backlink');
  sourceFinal = 'https://publisher.example/story'; targetFinal = SITE + '/'; await service.verify('opp', 'https://publisher.example/story'); assert.equal(saved.isLive, false, 'Target redirect to home must not count');
  await assert.rejects(service.verify('opp', 'https://other.example/story'));
  console.log('Backlink verifier checks passed: href, rel, target reachability, source redirects and workflow.');
}
verifierChecks().catch(error => { console.error(error); process.exitCode = 1; });

async function discoveryChecks() {
  let searches = 0; const stored: Array<Record<string, unknown>> = [];
  const db = { backlinkOpportunity: { upsert: async (args: { where: { domain_url: unknown }; create: Record<string, unknown>; update: Record<string, unknown> }) => { assert.deepEqual(Object.keys(args.update), ['lastCheckedAt']); stored.push(args.create); return args.create; } } };
  const ai = { searchWeb: async () => { searches++; return { sources: [{ url: 'https://industry.example/warehouse', title: 'Real source' }, { url: 'https://industry.example/duplicate', title: 'Same domain' }, { url: 'https://spam.example/casino', title: 'Spam' }], text: '' }; } };
  const fetcher = async (url: string) => ({ url, status: 200, headers: {}, html: `<title>Forklift warehouse</title><p>Forklift warehouse Vietnam ${url.includes('spam') ? 'casino' : 'equipment'}</p>` });
  const service = new BacklinkResearchService(db as never, ai as never, { catalog: async () => [product, post] } as never, fetcher);
  const result = await service.research('forklift warehouse Vietnam'); assert.equal(searches, 1); assert.equal(result.results.length, 1); assert.equal(stored.length, 1); assert.equal(result.skipped.length, 1); assert.equal(stored[0].authorityScore, undefined);
  console.log('Discovery checks passed: fresh search, cited evidence, same-domain dedup, spam exclusion, preserved admin state.');
}
discoveryChecks().catch(error => { console.error(error); process.exitCode = 1; });
