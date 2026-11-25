# Production Content & SEO Audit — 25/11/2026

## Scope and evidence
Code-level audit of current main Next.js frontend and NestJS product API, plus GitHub workflow status. External live HTML/HTTP/GSC inspection was **not available** from the connected environment; no HTTP/indexing/Core Web Vitals claims were inferred from code.

## Findings ranked by business effect

| Priority | Finding | Evidence | Remediation |
| --- | --- | --- | --- |
| P0 | Quote button on product listing created a CRM Client using phone as email rather than a QuoteLead. This breaks intended CRM funnel/lead routing. | `frontend/src/app/products/ProductsPage.tsx`, old `handleSubmitQuote()` | Reuse established `QuoteRequestDialog` and `quoteLeadsAPI`, retaining product ID and conversion event |
| P0 | Missing or failing product image displayed a shared illustrated tire image as if it were the actual SKU. Weakens trust and risks deceptive image association. | `frontend/src/components/ProductImage.tsx` previously used `ContentImage` fallbacks | Show transparent descriptive placeholder, never an invented product photograph; real photo upload remains editorial work |
| P1 | One upstream failure in products/posts/rims/cases made sitemap generation fail entirely. | `frontend/src/app/sitemap.ts` previous `Promise.all` | Gracefully omit unavailable groups while preserving healthy URLs; emit error log for monitoring |
| P1 | Product JSON-LD did not communicate explicitly VAT-excluded PHOENIX pricing or item condition. Provisional/reference price could be given as Offer. | `frontend/src/lib/public-seo.ts` | Only include verified price offers; add VAT-exclusion PriceSpecification, condition, seller, without inventing stock/reviews |
| P1 | Legacy SEO from previously generated product metadata may persist in Admin DB. | seed 017 and Admin editable fields | Seed 017 already executed; audit actual per-SKU fields via authorized read-only DB check before rewriting anything |
| P1 | Shop relies on image fallback and product-specific verified specifications remain incomplete for some SKUs. | `ProductImage`, Admin content fields, Product schema | Obtain SKU-specific real images, verified technical specs and condition before expanding indexing |
| P2 | Keyword-focused landing pages contain common explanatory prose; content depth/uniqueness requires editorial improvement. | category and size page sources | Review actual buyer intent, add verified fitting details and real imagery; do not mass-produce near duplicates |
| Verification required | No current proof of real Google index status, crawl errors, active canonical, or real Core Web Vitals | Live site and Search Console not directly accessible in audit environment | Run URL Inspection, Page Indexing, sitemap status, canonical reports, and CrUX/PageSpeed; compare to URLs |

## Already favorable
- Product detail metadata is generated server-side from API; canonical URL uses slug and old aliases redirect.
- Product API returns DB-backed `description`, `shortDescription`, `highlights`, `applications`, `specifications`, `seo` and price.
- SEO and buyer copy are editable through Admin after PR #141; seed 017 ran.
- QuoteLead dialog supports product association, optional image, Zalo and analytics.
- `robots.ts` advertises sitemap and disallows admin/private paths; filtered catalog URLs are noindex.

## Deploy and post-deploy acceptance
1. Run GitHub PR Backend/Frontend/Backup checks, then merge only after review.
2. Verify production `/robots.txt`, `/sitemap.xml`, `/products`, 4 PHOENIX product slugs, a product without image, and an alias redirect: actual HTTP 200/301, indexability, canonical, title, meta, JSON-LD. Do not assume code guarantees live behavior.
3. Trigger test quote lead from **product listing** and **detail** with permitted test contact; check Lead CRM and conversion analytics; do not pollute real CRM with arbitrary fake contacts.
4. Verify product without real image reads 'Chưa có ảnh sản phẩm thực tế' and has no `image` property in Product JSON-LD.
5. Open Google Search Console: URL Inspection for representative products, Page Indexing, submitted sitemap and Google-selected canonical; track impressions, clicks, calls, Zalo and quote leads over time. Ranking #1 cannot be guaranteed.
6. For any sitemap source failure, check server logs and re-run audit after recovery to ensure all URLs return to the sitemap.

## Remaining limits
This patch does not access or alter private production PostgreSQL, publish new product media, assert real indexing, or change product SEO fields managed by Admin.
