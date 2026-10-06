# P2.1 production migration strategy

P2.1 starts with an explicit production-schema contract so application rollout cannot silently outrun the database again.

## Release contract

1. Every schema change is represented by an immutable Prisma migration and must pass the PR fresh-PostgreSQL migration/drift suite.
2. P2.1 migrations use **expand/contract** only. Add nullable columns/tables/indexes first; deploy compatible application code; backfill separately; enforce or remove old schema only in a later release.
3. Pull requests automatically reject newly changed migration SQL containing destructive operations such as DROP/TRUNCATE, ALTER TYPE, or SET NOT NULL.
4. Production database migration remains a separate protected operation until a least-privilege production migration credential is configured. Application code must remain compatible with the currently deployed production schema until that operation is completed.
5. Before a migration is applied to production: verify backup/restore readiness, run `prisma migrate status`, review pending migrations, then run `prisma migrate deploy` exactly once. Never use `prisma db push` in production.
6. After migration: run `prisma migrate status`, backend readiness, and read-only business smoke gates before promoting schema-dependent application behavior.
7. Data backfills are separate, idempotent, observable, and restartable.

## P2.1 rollout

Stock reservation will be introduced additively. The first reservation release must not require a destructive change to existing `StockLocation`, `Order`, `OrderItem`, or `InventoryTransaction` records. Reservation-aware behavior is enabled only after the additive migration has been applied and verified in production.

## Current boundary

CI proves the full migration chain on a fresh PostgreSQL database. It does not mutate production. Until a dedicated production migration credential/policy is configured, production migration execution remains an explicit release step rather than being hidden inside Vercel deployment.


## Final integration audit checkpoint

P2.1 reservation/Stripe lifecycle hardening completed through PR #82. This audit PR intentionally changes documentation only so the full PR integration workflow runs against the merged integration head, including migration safety, fresh PostgreSQL migration/drift checks, backend PostgreSQL concurrency tests, frontend verification, and backend build. Production promotion remains blocked until the separate production migration preflight is completed.
