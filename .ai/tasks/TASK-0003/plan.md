# Planner — TASK-0003

1. RED: replay all migrations into CI PostgreSQL and run Prisma migrate diff against schema.prisma.
2. Capture the exact Prisma-generated SQL drift output.
3. Classify each difference: missing object, incompatible type/default/nullability, index/FK, or legacy-only object.
4. Architect decides which differences are safe additive/idempotent repairs.
5. Developer adds only approved safe repairs; destructive differences remain documented and blocked.
6. Re-run fresh migration + drift gate until Prisma reports an empty diff.
7. Reviewer inspects repair SQL and CI permanence.
8. QA requires green final-head frontend/backend Actions.
