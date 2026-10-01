# Daily SEO Automation

## Architecture

Vercel Cron invokes `POST /api/v1/internal/daily-content/run` at `19:00 UTC`, equivalent to **02:00 Asia/Ho_Chi_Minh**. The route requires `Authorization: Bearer $CRON_SECRET`; only Vercel has that secret. `DailyContentRun.runDate` is the distributed idempotency key and plans use slots 1–2, so duplicate invocations cannot create more than two posts.

The job first attempts the bounded public-HTML SEO audit already implemented by `SeoService`. Audit failure is recorded in the run summary but does not prevent independent content planning. It then creates one commercial/product-related plan and one informational/supporting plan, validates duplicate/cannibalization risk against the last 90 days, generates with at most two retries after the first attempt, validates structure/metadata/verified links, and saves drafts only.

## Configuration

```env
CRON_SECRET=<long-random-production-secret>
SEO_AUTOMATION_ENABLED=true
SEO_AUTOMATION_AUDIT_ENABLED=true
```

Set `SEO_AUTOMATION_ENABLED=false` to prevent any run from creating plans or drafts. The Vercel cron schedule is defined in `backend/vercel.json`; Vercel does not support reading cron expressions from runtime environment variables. Any schedule change must be reviewed and deployed.

## Manual review

An `ADMIN_MANAGER` can view the current run and invoke a run from **Admin → AI Studio → Daily SEO Content**. Generated posts remain `DRAFT` with `noindex,follow`; publishing, robots/canonical changes, edits to published content and internal-link insertion require a human approval step in the existing admin workflow.

## Reporting and limits

`DailyContentRun.summary` records planned/draft/failed counts, SEO audit outcome and Search Console status. Search Console is currently `UNAVAILABLE_CONFIGURATION_REQUIRED`: no rankings, traffic, impressions or positions are inferred. Configure a dedicated integration before reporting such metrics.

The full audit has bounded concurrency and never crawls external links. Do not use this automation to create thin pages, change indexed URLs, submit backlinks, or make unverified product claims.
