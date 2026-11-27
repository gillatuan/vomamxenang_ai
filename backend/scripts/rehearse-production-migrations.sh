#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Run Prisma Migrate exclusively against a fresh local PostgreSQL 18 clone.
# Production connection is used only by the existing read-only pg_dump/restore verifier.
[[ "${APP_ENV:-}" == production ]] || { echo "::error::APP_ENV must be production"; exit 1; }
[[ "${GITHUB_REF:-}" == refs/heads/main ]] || { echo "::error::Only reviewed main allowed"; exit 1; }
[[ -n "${PRODUCTION_DATABASE_URL:-}" && -n "${TEMP_RESTORE_ADMIN_URL:-}" ]] || {
  echo "::error::Missing production backup/restore connections"; exit 1;
}
[[ "${TEMP_RESTORE_DATABASE_URL:-}" == *"/vmx_restore_migration_probe" ]] || {
  echo "::error::Unexpected isolated restore target"; exit 1;
}
command -v pg_restore >/dev/null
command -v psql >/dev/null
command -v pg_dump >/dev/null
export BACKUP_MODE=production-only
export PRISMA_PROVIDER_APP_DATA_RESTORE=YES
export BACKUP_DIR="$RUNNER_TEMP/historical-migration-private"
mkdir -m 700 -p "$BACKUP_DIR"
rehearsal_db=vmx_migration_rehearsal
rehearsal_url='postgresql://postgres:postgres@localhost:5432/vmx_migration_rehearsal'
created=0
cleanup() {
  if [[ "$created" == 1 ]]; then
    psql "$TEMP_RESTORE_ADMIN_URL" -v ON_ERROR_STOP=1 -qAtc "DROP DATABASE IF EXISTS \"$rehearsal_db\" WITH (FORCE)" >/dev/null 2>&1 || true
  fi
  rm -rf -- "$BACKUP_DIR"
}
trap cleanup EXIT

# This trusted program takes a consistent production snapshot, restores it into
# a disposable database, checks table/row inventories, and removes the first
# throwaway DB. Archive is retained privately for a second isolated rehearsal.
bash scripts/db-audit-backup.sh
archive="$(find "$BACKUP_DIR" -type f -name production.dump -print -quit)"
[[ -n "$archive" && -s "$archive" ]] || { echo "::error::Private production archive missing"; exit 1; }
root="$(dirname "$archive")"
[[ -s "$root/verified.json" ]] || { echo "::error::Snapshot restoration proof missing"; exit 1; }
[[ "$(node -p "require(process.argv[1]).restoreVerified===true" "$root/verified.json")" == true ]] || {
  echo "::error::Snapshot restoration proof invalid"; exit 1;
}
psql "$TEMP_RESTORE_ADMIN_URL" -v ON_ERROR_STOP=1 -qAtc "CREATE DATABASE \"$rehearsal_db\" TEMPLATE template0" >/dev/null
created=1
restore_args=(--dbname="$rehearsal_db" --no-owner --no-acl --exit-on-error)
if [[ -s "$root/isolated-restore-list.txt" ]]; then
  restore_args+=(--use-list="$root/isolated-restore-list.txt")
fi
# Never print data, database dump output or credentials into public logs.
if ! pg_restore "${restore_args[@]}" "$archive" >/dev/null 2>&1; then
  echo "::error::Isolated application-data clone restore failed"; exit 1
fi

# Fail if the connection points anywhere except the local ephemeral PostgreSQL service.
case "$rehearsal_url" in
  postgresql://postgres:postgres@localhost:5432/vmx_migration_rehearsal) ;;
  *) echo "::error::Unsafe rehearsal database URL"; exit 1;;
esac
export DATABASE_URL="$rehearsal_url"
echo 'Running Prisma migration rehearsal on isolated local PostgreSQL 18 ONLY.'
set +e
./node_modules/.bin/prisma migrate deploy > "$BACKUP_DIR/migrate-output.txt" 2>&1
code=$?
set -e
if [[ "$code" != 0 ]]; then
  # Display names of pending migrations for diagnosis, not raw SQL/data.
  echo "::error::Prisma migrate deploy failed in throwaway database; production unchanged"
  grep -E '(^[0-9]{14}_|^Error:|^Error code:|^P[0-9]{4}|^The following migration)' "$BACKUP_DIR/migrate-output.txt" | head -30 || true
  exit 1
fi
psql "$rehearsal_url" -v ON_ERROR_STOP=1 -qAtc "
SELECT CASE WHEN
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='Product' AND column_name IN ('priceMin','priceMax'))=2
  AND (SELECT COUNT(*) FROM pg_constraint WHERE conname='Product_price_range_valid')=1
  AND (SELECT COUNT(*) FROM public.\"_prisma_migrations\" WHERE migration_name='20261127120000_product_price_range' AND finished_at IS NOT NULL AND rolled_back_at IS NULL)=1
THEN 'REHEARSAL_SCHEMA_PASS' ELSE 'REHEARSAL_SCHEMA_FAIL' END" | grep -qx REHEARSAL_SCHEMA_PASS || {
  echo "::error::Price range schema postconditions failed on isolated clone"; exit 1;
}
echo 'REHEARSAL PASS: all pending Prisma migrations applied on disposable PostgreSQL 18 clone; product price columns and constraint verified.'
echo 'Production schema and migration history were NOT modified.'
