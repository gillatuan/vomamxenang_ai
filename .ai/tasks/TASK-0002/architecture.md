# Architect — Phase 2 Integration Safety

## Test boundary
Use the real `PrismaService`/Prisma client against the ephemeral PostgreSQL 16 service already provided by CI. Tests must generate unique identifiers and clean their rows in `finally` blocks.

## Inventory invariant
A failed receipt/issue confirmation must leave all affected stock quantities unchanged. The integration test must assert persisted database state after the transaction rejects.

## Payment invariant
Webhook fulfillment is serialized per order using the PostgreSQL Order row lock. The integration suite must issue two concurrent completed events for the same order and assert exactly one inventory decrement and one PAID terminal state.

## CI
No new database infrastructure. Reuse the PostgreSQL service and `prisma migrate deploy` already in `verify-backend`. Integration tests run after migrations and before build.

## Constraints
No schema migration is required for this phase. If implementation cannot satisfy concurrency guarantees without schema change, stop and raise an architecture finding rather than adding a production migration implicitly.
