# TASK-0002 — Phase 2 Integration Safety

## Goal
Move critical inventory/payment guarantees from mock-only regression coverage to PostgreSQL-backed integration verification.

## Requirements
- Prove multi-line inventory confirmation rolls back atomically on failure against PostgreSQL.
- Prove repeated and concurrent Stripe checkout-completed delivery cannot double-decrement stock.
- Prove insufficient stock cannot partially fulfill an order or mark it PAID.
- Run these integration tests in CI using the existing PostgreSQL service.
- Preserve existing unit/critical tests.
- No production schema/destructive migration unless separately approved.
- No direct main changes; Phase 2 ships by PR and human approval.

## Acceptance criteria
1. Reproducible integration test setup creates isolated test data and cleans it up.
2. Inventory rollback test passes against real Prisma/PostgreSQL transaction semantics.
3. Webhook sequential duplicate, concurrent duplicate, and insufficient-stock cases pass against PostgreSQL.
4. `yarn test:ci`, typecheck, and builds pass in GitHub Actions.
5. Reviewer and QA artifacts record evidence and residual risks.
