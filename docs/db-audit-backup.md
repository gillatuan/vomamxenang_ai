# P1 database comparison and verified backup

Run `bash backend/scripts/db-audit-backup.sh` on a trusted operator machine with Node 20+, `psql`, `pg_dump`, `pg_restore` and `diff` on PATH. Client tools must support the production PostgreSQL version. No AWS or Prisma paid backup feature is required.

Set private environment variables (never commit URLs):

- `PRODUCTION_DATABASE_URL`: direct production PostgreSQL connection.
- `LOCAL_DATABASE_URL`: a distinct local/reference database with the code/seed data you want to compare.
- `TEMP_RESTORE_ADMIN_URL`: administrator connection to a disposable loopback PostgreSQL server.
- `TEMP_RESTORE_DATABASE_URL`: a new database on that server named `vmx_restore_*`.
- `BACKUP_DIR`: optional private directory outside the repository; defaults to `~/vomamxenang-private-backups`.

The script creates a new restore database and refuses existing targets. It never drops an existing database and cleans up only the database it created. Production/local operations are read-only. Production dump, schema, table counts, migration ledger, seed history and content fingerprints use one exported repeatable-read snapshot, so concurrent sales cannot invalidate the restore comparison. Local inventory uses its own snapshot. Restored counts, ledger, seed keys and seeded-table content must match the production snapshot before `verified.json` is written. A failure retains the private archive for investigation and never grants migration approval.

Each private directory contains the custom-format dump, SHA-256, archive TOC, schemas, local/production comparison reports and restore evidence. `migration-status.json` identifies repository migrations pending in production, unknown ledger entries, unresolved attempts and checksum mismatches. `seed-status.json` identifies pending and unknown versioned seed keys. Content fingerprints detect equal-count differences; they include IDs and may differ legitimately between environments. Schema dumps may include environment/version metadata. Review differences rather than overwriting production with local seed/demo data.

## Workflow

`Production migration execution` accepts a full reviewed `audited_sha`, the existing audited `migration_ref`, and either `VERIFY-BACKUP-ONLY` or `MIGRATE-PRODUCTION`. It checks out the SHA once; backup and deployment therefore use the same code revision. The backup gate no longer calls Prisma's managed backup API. Existing legacy checksum, migration safety, pending-set, post-deploy status and drift checks remain.

Verification-only uses an isolated PostgreSQL service on a hosted runner. Its backup is ephemeral and is never accepted as the migration backup. Migration uses a Linux self-hosted runner labeled `production-db-backup`, with Docker, Node/PostgreSQL clients and a persistent private disk. Configure Production variable `PRODUCTION_BACKUP_DIR` as an absolute persistent directory outside the checkout, and Production secrets `DIRECT_DATABASE_URL` and `LOCAL_DATABASE_URL` (reachable from that runner). Ensure this runner is restricted to trusted workflows and backup files are accessible only to its operator. Configure version-compatible PostgreSQL clients; the workflow's apt installation is a default for Ubuntu runners.

For actual operator-local comparison, run the script on that machine; a hosted runner cannot reach your laptop's localhost. Workflow `LOCAL_DATABASE_URL` must refer to a separately reachable reference DB. Migration refuses an absent persistent path or hosted runner. No dumps, table contents or private reports are uploaded as GitHub artifacts. Keep backups under your normal private retention/storage policy; loss of that disk loses the backup. Prisma free alone is not durable backup storage.

The legacy `Production DB migrate` shortcut is retired. The category recovery workflow remains read-only until recovery is separately reviewed with backup evidence. No production migrations or seeds are executed by PR CI. Production seed application remains a separate authorized versioned/idempotent operation.

## Verification

PR CI tests URL safety, runs a real dump/restore on PostgreSQL fixtures, checks target cleanup, rejects an existing target without deleting it, and injects a restore failure to verify no success marker is written. Backend/frontend integration checks remain enabled. Passing fixtures does not claim the real production backup has run: run the protected verification with configured credentials after review, and review the private comparison reports before any production operation.
