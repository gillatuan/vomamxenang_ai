# TASK-0003 — Full Prisma schema ↔ fresh migration database drift audit

## Goal
Prove that replaying every committed Prisma migration into an empty PostgreSQL database produces a schema compatible with `backend/prisma/schema.prisma`.

## Required audit
- Tables/models and mapped table names
- Enums and enum values
- Columns, PostgreSQL types, nullability and defaults
- Primary/unique/index constraints
- Foreign keys and referential actions
- Prisma-visible schema drift using Prisma's own migration diff engine

## Safety
- Audit runs only against the ephemeral CI PostgreSQL database.
- Do not introspect or mutate production.
- Additive/idempotent repair migrations may be proposed and tested.
- Any destructive migration, column/type rewrite, DROP, or production data migration stops for human approval.
- Phase 3 is stacked on Phase 2 until PR #2 merges.

## Acceptance criteria
1. Fresh `prisma migrate deploy` succeeds.
2. `prisma migrate diff --from-url <fresh-db> --to-schema-datamodel prisma/schema.prisma --exit-code` reports no drift.
3. Drift is documented before repair.
4. Safe repair migrations are replayable on an empty DB.
5. CI permanently gates future migration/schema drift.
6. Reviewer + QA evidence recorded on the final head.
