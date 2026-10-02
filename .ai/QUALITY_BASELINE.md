# Phase 1 Quality Baseline

Date: 2026-10-02

## Existing automated coverage
Backend CI had executable tests for SEO, production seed runner, content aliases and a warehouse-cleanup draft. The CI workflow previously ran only SEO + production-seed tests; Phase 1 now exposes `yarn test:ci` and runs all four existing executable suites.

## Critical-domain coverage gaps
No dedicated automated tests were found for:
- Auth registration/login/refresh and role authorization.
- Inventory receipt/issue confirmation and assembly invariants.
- Orders checkout, B2B/retail price selection and order status transitions.
- Stripe webhook signature, idempotency and stock deduction.

These gaps block high-autonomy agent changes in those domains.

## Risk findings to lock down with tests before behavior changes
1. Inventory receipt/issue confirmation updates multiple stock rows through `Promise.all` rather than a single database transaction. Partial updates are possible if a later detail fails.
2. Stripe checkout completion marks an order PAID and decrements matching stock rows, but the current flow does not first prove sufficient stock for every line.
3. Checkout-completed webhook processing needs an explicit idempotency test so repeated Stripe delivery cannot double-decrement stock.
4. Pricing selection (customer price matrix -> selling price -> import price fallback) is business-critical and currently has no dedicated regression tests.
5. Auth public registration intentionally forces STOREKEEPER and role guard protects restricted behavior; both need regression coverage.

## Quality-gate policy
Until the critical suites exist, changes touching auth, inventory, orders/payment or pricing require human review plus task-specific tests. Developer agents must not interpret the current green CI as proof that these domains are safe.

## Next implementation slice
Add isolated service/guard tests in this order:
1. AuthService + RolesGuard.
2. InventoryService confirmation/assembly invariants.
3. OrdersService pricing/status behavior.
4. Stripe webhook idempotency and stock safety.

Only after those tests establish current/desired behavior should transactional or idempotency fixes be implemented.
