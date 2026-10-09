# PostgreSQL production backup and restore drill

`backend/scripts/self-managed-production-backup.sh` replaces the abandoned AWS/S3 proposal. It uses only PostgreSQL client tools and writes the production archive and verification artifacts beneath `.private/production-backups/`, which is ignored by Git.

The script is deliberately fail-closed. It never invokes Prisma migrations, only uses `pg_dump` against production, and refuses a restore URL that points to either production or the local development database. Restore targets must be named `vmx_restore_*`.

## Prerequisites

- PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`). On macOS with Homebrew, `brew install libpq` is sufficient; the script detects Homebrew's `libpq` path automatically.
- A direct PostgreSQL URL for production, local development, and an isolated temporary database. It may be on the local PostgreSQL server, but must be a different database. Do not use Prisma Accelerate URLs.
- Permission to create and drop only the isolated temporary database.

## Run locally

Load URLs from the local environment without printing them, then set a **separate** temporary server/database URL. The administrative URL must not point to the restore database itself.

```bash
cd backend
set -a
source .env.production
export PRODUCTION_DATABASE_URL="$DATABASE_URL"
source .env.local
export LOCAL_DATABASE_URL="$DATABASE_URL"
export TEMP_RESTORE_ADMIN_URL='postgresql://…/postgres'
export TEMP_RESTORE_DATABASE_URL='postgresql://…/vmx_restore_pr96'
export TEMP_RESTORE_DATABASE_NAME='vmx_restore_pr96'
set +a
bash scripts/self-managed-production-backup.sh
```

On success the private timestamped directory contains:

- `production.dump` and its SHA-256 checksum;
- readable `pg_restore` table-of-contents;
- schema, `_prisma_migrations`, seeded-table inventory, and table-count comparisons for local versus production;
- source-versus-restored table-count and migration-history verification.

The temporary database is dropped automatically. Set `KEEP_TEMP_RESTORE_DATABASE=1` only when an explicit manual inspection is needed, then drop it yourself. Review every generated `*.diff` before any migration decision; differences are evidence to investigate, not authorization to change production.
