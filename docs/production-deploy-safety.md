# P2.0 production deploy safety audit

## Guardrails implemented

- Pull requests run full frontend/backend integration verification before merge.
- Production deploy remains gated on frontend and backend verification.
- Backend CI validates Prisma schema, applies all migrations to a fresh PostgreSQL database, and checks schema drift before deployment.
- Backend deployment is smoke-tested before frontend deployment.
- Liveness checks Nest/Vercel routing without touching business data.
- Readiness executes a database round-trip (`SELECT 1`).
- Public storefront API endpoints and the frontend root are checked after deployment.
- Smoke checks are read-only and retry transient cold-start/network failures.

## Migration safety boundary

The production workflow does **not** run migrations against the production database. This is intentional until a production `DATABASE_URL` secret and an explicit migration policy are approved. Running `prisma migrate deploy` against the CI PostgreSQL service proves migration completeness but does not mutate production.

Before future automatic production migrations: use a least-privilege migration credential; backup/restore-test production; require backward-compatible expand/contract migrations; run `prisma migrate deploy` exactly once before application rollout under the protected Production environment; abort on migration failure and never fall back to `prisma db push`; keep data backfills separate, idempotent, observable, and restartable.

## Remaining operational recommendation

Configure GitHub branch protection so PR integration checks are required before merging to the P2 integration branch and main. Repository policy configuration is intentionally separate from application code.
