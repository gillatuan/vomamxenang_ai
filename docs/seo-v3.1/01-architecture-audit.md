# Architecture Audit

## Existing architecture

**EXISTING** — Frontend is Next.js 14 App Router with TypeScript and MUI. Backend is NestJS 10 with Prisma 5 and PostgreSQL. The REST API is versioned by Nest URI versioning and production routes are served beneath `/api/v1`.

**REUSE** — Batch 1 extends the existing Nest `SeoModule`; it does not create a parallel SEO service or a new framework.

## Existing database entities

**EXISTING** — `Product`, `Post`, `User`, `StoreInfo`, `AboutPage`, inventory entities, `AiGeneration`, comments and favourites exist. Existing SEO workbench entities are `SeoAudit`, `InternalLinkSuggestion`, `BacklinkOpportunity`, and `Backlink`.

**NEW** — `SeoKeyword`, `ContentCampaign`, and `CampaignPost` are required. `SeoAudit` needs non-destructive optional fields to retain a reviewable audit for one Product or Post.

## Existing Product architecture

**EXISTING** — `Product` has `slug`, aliases, descriptions, tags, image URL and JSON SEO metadata. Product public reads exclude purchase cost; admin CRUD is protected by JWT and `ADMIN_MANAGER`.

**MODIFY** — Add optional `seoKeywords` and `seoAudits` relations only. Existing product fields remain the publishing source of truth.

## Existing Blog/Post architecture

**EXISTING** — `Post` has `slug`, aliases, excerpt, table of contents, JSON SEO metadata, tags and publication status. Admin CRUD is protected by the existing guards.

**MODIFY** — Add optional `seoKeywords`, `seoAudits`, and campaign join relations. Post itself is not duplicated.

## Existing SEO architecture

**EXISTING** — `SeoModule` already provides an authenticated `/admin/seo` API, site audit reports, keyword-map analysis, reviewable internal-link suggestions, and backlink opportunity records. Public SEO already uses Next metadata, canonical URLs, JSON-LD, sitemap and robots.

**REUSE** — Existing `SeoService`, `BacklinkResearchService`, SEO metadata in Product/Post and current audit report JSON.

**MODIFY** — Add persistent keyword clustering and reviewable per-content audits. Add typed CRUD endpoints for existing internal-link and backlink-opportunity records.

**NOT NEEDED** — A second SEO metadata table, a second sitemap, or another keyword-map algorithm.

## Existing Media architecture

**EXISTING** — Product and page images are URL fields; generated catalog images are served from the Next public directory. There is no Prisma `Media` model.

**NOT NEEDED** — A Media model in Batch 1. Campaign posts reuse `Post`; future media handling can attach to the existing URL approach or a deliberately designed media module.

## Existing Admin architecture

**EXISTING** — `/admin` is a protected Next layout. The sidebar already contains SEO navigation and an existing SEO workbench page.

**NOT NEEDED** — Admin UI changes in Batch 1, per the stop condition.

## Existing Authentication/RBAC

**EXISTING** — `JwtAuthGuard`, `RolesGuard`, and `@Roles('ADMIN_MANAGER')` protect admin endpoints. Roles are `ADMIN_MANAGER` and `STOREKEEPER`.

**REUSE** — All Batch 1 endpoints use the same JWT + `ADMIN_MANAGER` guard/decorator stack. No permission table or second authorization system is introduced.

## Existing Seed mechanism

**EXISTING** — Local seeds use `prisma/seed.ts`; immutable production releases use `SeedHistory` and ordered production seed files.

**NOT NEEDED** — Production seed changes are intentionally excluded by this batch.

## Existing CI/CD

**EXISTING** — GitHub Actions verifies frontend/backend then deploys Vercel on pushes to `main`. Vercel runs Prisma migrations before backend deployment.

**NOT NEEDED** — CI/CD changes in Batch 1.

## Existing testing

**EXISTING** — Typecheck/build commands and TypeScript executable tests exist (`test:seo`, `test:production-seed`). GitHub Actions runs them.

**MODIFY** — Add a focused Batch 1 test for DTO validation, service behavior and existing guard behavior.

## Reusable components

- Nest `SeoModule`, `SeoService`, Prisma service and response/error conventions.
- JWT/RBAC guards and `@Roles` decorator.
- Product/Post SEO JSON and public SEO metadata utilities.
- Existing `SeoAudit`, `InternalLinkSuggestion`, `BacklinkOpportunity` and `Backlink` models.
- Existing Prisma migration and test workflows.

## Missing functionality

- Persistent, clustered SEO keywords tied optionally to a product or post.
- Per-content SEO audit fields/querying, beyond the current whole-site JSON report.
- Campaign-to-Post relation and campaign lifecycle data.
- Typed CRUD APIs for SEO keywords, internal-link suggestions and campaigns.

## Potential conflicts

- `BacklinkOpportunity` already contains legacy score columns. Batch 1 must not populate or present authority/spam metrics as verified facts.
- Existing `/admin/seo/research` predates this batch. Batch 1 does not change or execute research because the prompt prohibits backlink research in this batch.
- Existing controllers outside SEO contain untyped legacy request bodies; Batch 1 changes only its own inputs and does not broaden that refactor.
- The local PostgreSQL migration was applied successfully on 2026-09-16. It remains an additive schema change and should still be rehearsed on a disposable staging database before production approval.

## Recommended implementation

1. Extend the existing schema with minimal relations and indexed models.
2. Add one additive Prisma migration; never alter existing migration history or delete data.
3. Extend `SeoService` and `SeoController` under `/api/v1/admin/seo` using DTOs and existing admin guards.
4. Add executable unit-style tests for validation, service persistence contracts and auth/RBAC guard outcomes.
5. Document the API and stop before UI, AI, research, seed and deployment work.
