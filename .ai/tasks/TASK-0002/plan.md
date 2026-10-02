# Planner — Phase 2

1. Build a PostgreSQL-backed critical integration harness using the CI DATABASE_URL.
2. Add inventory atomicity integration coverage first.
3. Add Stripe fulfillment integration coverage, including concurrent delivery.
4. Wire the suite into backend `test:ci`.
5. Update quality baseline to distinguish mock regression vs database integration guarantees.
6. Reviewer checks transaction isolation, row locking, cleanup and test determinism.
7. QA requires a green GitHub Actions run on the PR head.

Out of scope: new product features, schema redesign, destructive migrations, production deploy.
