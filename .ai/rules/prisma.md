# Prisma and Database Rules
- Never edit an already-applied production migration.
- Schema changes require migration and compatibility assessment.
- Destructive changes require human approval, rollback/backup and data migration plan.
- Prefer expand/migrate/contract for risky changes.
- Preserve inventory/order invariants; use atomic multi-record transitions where correctness requires it.
- Seeds follow the existing versioned/idempotent production-seed mechanism.
- Agents never execute production migration/seed operations without explicit human approval.
