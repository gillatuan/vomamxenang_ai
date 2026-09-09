# V3 SEO architecture

Inspected before implementation: NestJS + Prisma/PostgreSQL; Next.js 14 App Router; public Product/Post status filters; slug and historical aliases; JSON `seo`; metadata/canonical helpers; sanitized rich text + Tiptap; AI Studio preview/apply; sitemap/robots; Vercel build and immutable production seeds.

Reuse `Product.seo` and `Post.seo` for title, description, primaryKeyword, secondaryKeywords, keywords, imageAlt and optional blog imageUrl. No duplicate SEO columns. Category is inventory classification, not a public landing-page taxonomy. Brand/size are Product attributes. `/products` is the existing commercial catalog; no speculative category or doorway pages are created.

## Public rendering

Product/blog details retain alias redirects and editable metadata. JSON-LD includes real Product/BlogPosting fields plus BreadcrumbList. No invented offers, ratings or reviews. Homepage Organization uses only the site's name and URL. Existing sample comments have been removed.

Catalog pages load their initial data on the server. Related navigation is ranked by real size, brand, tire type and topic overlap, with separate product/guide quotas. Descriptions are never automatically rewritten by page rendering. Existing explicit editor suggestions and AI Studio preview/apply remain the content approval boundary.

Sitemap excludes noindex as well as the existing API draft/private filters; canonical aliases only. API failure fails the sitemap request instead of publishing an apparently complete but empty sitemap. At the present 26 URLs one sitemap is appropriate. When approaching the 50,000 URL limit, use the existing collection loader behind paginated API reads and Next `generateSitemaps()` plus a sitemap index; preserve the current canonical and visibility filters. No invented category URLs are emitted.

## Admin and persistence

`/admin/seo`, `/products`, `/posts`, `/internal-links`, `/backlinks` are UI sections. `/api/v1/admin/seo/*` requires JWT plus ADMIN_MANAGER for every endpoint.

- SeoAudit: timestamped report snapshots (issues and real page observations).
- InternalLinkSuggestion: unique source/target pair, pending/approved/rejected/implemented. Approval does not change a description; admin edits the source. A later audit marks implemented only when the stored description contains the link.
- BacklinkOpportunity: domain+normalized URL uniqueness, typed status and category, evidence, targets, anchors, notes, nullable metrics, observed capabilities and outreach draft.
- Backlink: actual source/target link observations with anchor, rel, first-seen and last-checked timestamps.
- Keyword map is computed from published data and stored in audit snapshots. No separate keyword database until manual mapping/version requirements justify it.

Audit checks server-returned HTML, H1/headings, canonical, meta/title duplication, JSON-LD validity/types, images/alt, noindex, content depth, outgoing links and incoming graph. `ORPHAN_PAGE` means no incoming anchor in the crawled public HTML, excluding self-links; incomplete crawling suppresses this conclusion. Contextual incoming links are reported separately. Audit fetch errors are unknown, not passing pages. Size and brand targets come only from the DB. Scores are transparent prioritization/checklist heuristics, not Google rankings.

## Discovery and outreach

`BacklinkResearchService.research(query)` runs fresh OpenAI web search through the existing AI provider, requires cited URLs, fetches public evidence, rejects detected spam, ranks topical relevance, deduplicates by domain per batch and persists unique opportunities. Upserts retain admin decisions and notes. No search credentials or results are fabricated if the provider is unavailable.

Seed 009 is an immutable research batch from public web searches on 2026-09-09: 10 opportunities, 6 Vietnam / 4 international; the two Forkliftaction entries are different channels (forum discussion and editorial contribution). Evidence summaries, limits and source URLs travel with the records. All start DISCOVERED, all require admin review; none are backlinks or preapproved outreach.

Only APPROVED/CONTACTED/SUBMITTED opportunities may generate a customized AI outreach draft. No email/posting integrations exist. Guest-post support is null unless an explicit invitation provides evidence. DA/DR/traffic/ranking/spam metrics remain unknown without a real provider.

Verification requires a source on the opportunity domain, finds the actual destination anchor, reads rel and checks the destination returns 200 without redirecting to a different target. LIVE cannot be assigned through the review endpoint. An access denial does not prove link removal.

Public fetch respects robots.txt and access denial. DNS is checked and pinned to public addresses for every connection/redirect. Private/reserved IPs, credentials, unusual ports, oversized pages and excessive redirects are rejected. Authentication, CAPTCHA and crawl-delay requirements require manual review. No bypass or automatic retries.

Search Console UI access from the earlier task is separate from API integration. The dashboard explicitly reports API not connected and shows no fabricated analytics.

## Production and operations

Migration `20260909000100_seo_workbench` → seed `009-seo-opportunities` → SeedHistory → existing Vercel build. Earlier migrations/seeds remain unchanged. Schema additions do not rewrite Product/Post data.

Run from backend with dotenv pointing to the intended database (never commit env files):

```sh
DOTENV_CONFIG_PATH=.env.local node -r dotenv/config -r ts-node/register/transpile-only scripts/seo.ts audit
DOTENV_CONFIG_PATH=.env.local node -r dotenv/config -r ts-node/register/transpile-only scripts/seo.ts research 'xe nâng logistics Việt Nam danh bạ doanh nghiệp'
DOTENV_CONFIG_PATH=.env.local node -r dotenv/config -r ts-node/register/transpile-only scripts/seo.ts overview
```

The same services are callable by admin actions or future cron. Research is bounded to ten cited domains per call; use CLI for long research batches if a hosting execution limit is reached. Keep manual review before contact/posting. No scheduler is installed.

CI now runs frontend SEO tests and backend SEO policy/audit/seed tests, alongside the existing lint/typecheck/build and production seed-runner tests.

### Observed AI configuration limit

On 2026-09-09, the Vercel backend production environment has no `OPENAI_API_KEY`. The older local production env key returned HTTP 401. Fresh web-search and AI outreach generation therefore cannot be validated live until the owner configures a valid key in Vercel and redeploys. API errors are surfaced explicitly. The initial batch was researched with public web tools and is not presented as output from the unconfigured provider. Audit, recommendations, review workflow and public backlink verification do not require an AI key.
