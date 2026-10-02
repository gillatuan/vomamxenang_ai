# Reviewer Report — TASK-0002 Phase 2

Date: 2026-10-02

## Findings resolved
1. **BLOCKER — aggregate stock overdraw.** Multiple issue/order lines can target the same StockLocation. Per-line checks allowed 3 + 3 to consume stock 5.
   - Fixed by aggregating requested quantity by stock row.
   - Decrement uses `updateMany(where: { id, quantity: { gte } })` so the database performs an atomic compare-and-decrement.
   - Any failed row aborts the enclosing transaction, rolling back earlier deductions.

2. **BLOCKER — migration history drift.** A fresh `prisma migrate deploy` database had no `OrderItem` table although the Prisma schema and runtime use it.
   - Added an additive, idempotent repair migration.
   - No DROP, destructive ALTER, or data rewrite is included.

3. **MAJOR — mock rollback assertions were misleading.**
   - Persisted rollback/atomicity is now verified by the PostgreSQL integration suite rather than an in-memory transaction mock.

## Concurrency review
- Duplicate events for the same order remain serialized with an Order row lock and status re-check.
- Stock deduction itself now uses an atomic quantity precondition, protecting against concurrent fulfillment/issue operations from different orders.
- Multiple stock-row deductions are inside one Prisma transaction, so a later insufficient row rolls back earlier deductions.

## Residual risk
- The historical schema contains broader drift beyond OrderItem (legacy migrations and current schema are not a clean generated lineage). Phase 2 repairs the concrete runtime blocker found by fresh-DB integration; a full schema-drift audit should be a separate task.
- Raw SQL is parameterized (`$1`) but uses `$queryRawUnsafe`; replacing it with tagged `$queryRaw` is recommended as defense-in-depth, not a blocker for this scoped change.

## Decision
PASS. No remaining blocking reviewer finding for TASK-0002.
