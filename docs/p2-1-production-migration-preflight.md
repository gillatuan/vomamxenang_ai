# P2.1 production migration preflight runbook

Use the manually dispatched **Production migration preflight** workflow before any P2.1 application promotion.

The Production environment must contain a dedicated secret named `PRODUCTION_MIGRATION_DATABASE_URL`. It should point at the production PostgreSQL database with the minimum permissions required to inspect Prisma migration history. Do not paste the credential into a PR, issue, log, or chat.

The preflight is intentionally read-only: it validates the checked-in Prisma schema, runs `prisma migrate status`, and verifies that `_prisma_migrations` contains no unresolved failed entries. Pending migrations are reported rather than applied.

Before execution of `prisma migrate deploy`, review the exact pending list. P2.1 requires `20261006073000_add_stock_reservations` and `20261006074500_add_reservation_expiry`. Older pending migrations must be reviewed as part of the same production history; do not skip them or use `prisma db push`.

Migration execution remains a separate protected release operation. Backup/restore readiness must be confirmed before that operation.
