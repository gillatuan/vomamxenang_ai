# Architecture Guide
`frontend/` is Next.js. `backend/` is NestJS + Prisma. `.github/workflows/` is executable CI/CD truth.

Backend: keep changes in the owning Nest module; controllers handle transport, services application/domain behavior, Prisma access explicit and reviewable. Avoid circular dependencies.

Data: PostgreSQL via Prisma. Inventory is location-aware and transaction-oriented. Never reduce it to a single product quantity. Stock, assembly, orders, prices and payments must preserve consistency and test failure paths.

Frontend: follow App Router; keep server/client boundaries deliberate; reuse existing shared lib/context/store/components instead of duplicating infrastructure.

Application AI under `backend/src/ai` and `backend/src/daily-content` is product functionality. Engineering agents under `.ai/` are development controls; keep them decoupled unless explicitly required.

When docs conflict with code, inspect package scripts, schema/migrations, bootstrap and GitHub Actions; record documentation drift.
