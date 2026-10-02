# Quality Baseline

## Phase 1
Critical mock/service regressions cover auth/roles, inventory, orders/pricing and Stripe webhook behavior. CI runs frontend verification and backend tests/build against PostgreSQL.

## Phase 2 — PostgreSQL integration safety
TASK-0002 adds real PostgreSQL coverage for critical inventory/payment persistence and concurrency invariants.

Verified:
- Aggregate stock demand is evaluated per StockLocation, not independently per line.
- Issue and Stripe fulfillment use atomic conditional decrements.
- Failed multi-row operations roll back inside Prisma transactions.
- Concurrent duplicate Stripe completion does not double-decrement persisted stock.
- Fresh migration replay exposed and repaired the missing OrderItem migration.

Remaining engineering debt:
- Historical migration lineage has drifted from current schema; schedule a full fresh-schema vs Prisma schema audit.
- Continue requiring PostgreSQL integration coverage for inventory/payment transaction changes.
