# Architect — TASK-0003

## Source of truth
Runtime Prisma schema is the expected application contract. The committed migration chain must reconstruct that contract from an empty PostgreSQL database.

## Audit engine
Use Prisma's own `migrate diff` after `migrate deploy`; do not use `db push`, because db push would mutate the test database and hide migration drift.

## Repair policy
Safe without additional approval: CREATE missing table/index/FK/enum, ADD nullable column, ADD column with a non-destructive default, or idempotent equivalents when they preserve existing data.

Human approval required before implementation: DROP table/column/type, narrowing type conversion, making populated nullable columns NOT NULL without a proven backfill, enum value removal/rename, or other data rewrite.

## CI invariant
Every PR affecting backend/schema/migrations must be able to construct a fresh DB and produce zero Prisma diff. This becomes a permanent regression gate.
