#!/usr/bin/env bash
# Read-only production backup and restore drill. It never runs Prisma migrations.
set -Eeuo pipefail
umask 077

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
private_root="${PRODUCTION_BACKUP_DIR:-$repo_root/.private/production-backups}"
: "${PRODUCTION_DATABASE_URL:?Set PRODUCTION_DATABASE_URL to the direct production PostgreSQL URL}"
: "${LOCAL_DATABASE_URL:?Set LOCAL_DATABASE_URL to the direct local PostgreSQL URL}"
: "${TEMP_RESTORE_ADMIN_URL:?Set TEMP_RESTORE_ADMIN_URL to an administrative URL for the temporary PostgreSQL server}"
: "${TEMP_RESTORE_DATABASE_URL:?Set TEMP_RESTORE_DATABASE_URL to the temporary database URL}"
: "${TEMP_RESTORE_DATABASE_NAME:?Set TEMP_RESTORE_DATABASE_NAME (must start with vmx_restore_)}"

case "$private_root" in "$repo_root"/.private/*) ;; *) echo "::error::PRODUCTION_BACKUP_DIR must be inside $repo_root/.private"; exit 1;;
esac
[[ "$TEMP_RESTORE_DATABASE_NAME" =~ ^vmx_restore_[a-z0-9_]+$ ]] || { echo "::error::Temporary database name must start with vmx_restore_"; exit 1; }

libpq_bin="${PG_BIN_DIR:-}"
if [[ -z "$libpq_bin" ]] && command -v brew >/dev/null 2>&1 && brew --prefix libpq >/dev/null 2>&1; then
  libpq_bin="$(brew --prefix libpq)/bin"
fi
pg_dump_bin="${libpq_bin:+$libpq_bin/}pg_dump"
pg_restore_bin="${libpq_bin:+$libpq_bin/}pg_restore"
psql_bin="${libpq_bin:+$libpq_bin/}psql"
for command in "$pg_dump_bin" "$pg_restore_bin" "$psql_bin" shasum diff; do
  command -v "$command" >/dev/null || { echo "::error::Missing required command: $command"; exit 1; }
done

node -e '
const [productionValue, localValue, adminValue, restoreValue, expectedName] = process.argv.slice(1);
const [production, local, admin, restore] = [productionValue, localValue, adminValue, restoreValue].map(value => new URL(value));
const key = value => `${value.protocol}//${value.username}@${value.hostname}:${value.port || "5432"}${value.pathname}`;
if (![production, local, admin, restore].every(value => ["postgres:", "postgresql:"].includes(value.protocol))) throw new Error("All URLs must be PostgreSQL URLs");
if (key(restore) === key(production) || key(restore) === key(local)) throw new Error("Temporary restore URL must not target production or local database");
if (restore.pathname.slice(1) !== expectedName) throw new Error("TEMP_RESTORE_DATABASE_URL database name does not match TEMP_RESTORE_DATABASE_NAME");
if (admin.pathname.slice(1) === expectedName) throw new Error("TEMP_RESTORE_ADMIN_URL must connect to a different administrative database");
' "$PRODUCTION_DATABASE_URL" "$LOCAL_DATABASE_URL" "$TEMP_RESTORE_ADMIN_URL" "$TEMP_RESTORE_DATABASE_URL" "$TEMP_RESTORE_DATABASE_NAME" || { echo "::error::Unsafe database URL configuration"; exit 1; }

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="$private_root/$timestamp"
mkdir -p "$backup_dir"
chmod 700 "$repo_root/.private" "$private_root" "$backup_dir"

archive="$backup_dir/production.dump"
checksum_file="$backup_dir/production.dump.sha256"
cleanup_restore() {
  if [[ "${KEEP_TEMP_RESTORE_DATABASE:-0}" != "1" ]]; then
    "$psql_bin" "$TEMP_RESTORE_ADMIN_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TEMP_RESTORE_DATABASE_NAME\"" >/dev/null
  fi
}
trap cleanup_restore EXIT

table_counts() {
  local database_url="$1"
  local table escaped
  while IFS= read -r table; do
    escaped="${table//\"/\"\"}"
    printf '%s\t' "$table"
    "$psql_bin" "$database_url" -At -v ON_ERROR_STOP=1 -c "SELECT count(*) FROM public.\"$escaped\""
  done < <("$psql_bin" "$database_url" -At -v ON_ERROR_STOP=1 -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name")
}

migration_history() {
  "$psql_bin" "$1" -At -F $'\t' -v ON_ERROR_STOP=1 -c "SELECT migration_name, checksum, COALESCE(finished_at::text, ''), COALESCE(rolled_back_at::text, '') FROM \"_prisma_migrations\" ORDER BY migration_name, started_at"
}

seed_inventory() {
  table_counts "$1" | awk -F $'\t' '$1 ~ /^(AboutPage|Category|Location|Post|Product|SeoKeyword|Stock|StockLocation|StoreInfo|Warehouse|WheelRim)$/'
}

echo "Creating read-only custom-format production dump"
"$pg_dump_bin" --dbname="$PRODUCTION_DATABASE_URL" --format=custom --no-owner --no-acl --file="$archive"
test -s "$archive" || { echo "::error::Backup archive is empty"; exit 1; }
"$pg_restore_bin" --list "$archive" > "$backup_dir/production.toc"
grep -q 'TABLE DATA' "$backup_dir/production.toc" || { echo "::error::Backup contains no table data"; exit 1; }
shasum -a 256 "$archive" > "$checksum_file"

"$pg_dump_bin" --dbname="$PRODUCTION_DATABASE_URL" --schema-only --no-owner --no-acl > "$backup_dir/production-schema.sql"
"$pg_dump_bin" --dbname="$LOCAL_DATABASE_URL" --schema-only --no-owner --no-acl > "$backup_dir/local-schema.sql"
migration_history "$PRODUCTION_DATABASE_URL" > "$backup_dir/production-migrations.tsv"
migration_history "$LOCAL_DATABASE_URL" > "$backup_dir/local-migrations.tsv"
seed_inventory "$PRODUCTION_DATABASE_URL" > "$backup_dir/production-seed-inventory.tsv"
seed_inventory "$LOCAL_DATABASE_URL" > "$backup_dir/local-seed-inventory.tsv"
table_counts "$PRODUCTION_DATABASE_URL" > "$backup_dir/production-table-counts.tsv"
table_counts "$LOCAL_DATABASE_URL" > "$backup_dir/local-table-counts.tsv"

diff -u "$backup_dir/local-schema.sql" "$backup_dir/production-schema.sql" > "$backup_dir/schema.diff" || true
diff -u "$backup_dir/local-migrations.tsv" "$backup_dir/production-migrations.tsv" > "$backup_dir/migrations.diff" || true
diff -u "$backup_dir/local-seed-inventory.tsv" "$backup_dir/production-seed-inventory.tsv" > "$backup_dir/seed-inventory.diff" || true

echo "Restoring backup into isolated temporary database: $TEMP_RESTORE_DATABASE_NAME"
"$psql_bin" "$TEMP_RESTORE_ADMIN_URL" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TEMP_RESTORE_DATABASE_NAME\"" >/dev/null
"$psql_bin" "$TEMP_RESTORE_ADMIN_URL" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$TEMP_RESTORE_DATABASE_NAME\"" >/dev/null
"$pg_restore_bin" --dbname="$TEMP_RESTORE_DATABASE_URL" --no-owner --no-acl --exit-on-error "$archive"
table_counts "$TEMP_RESTORE_DATABASE_URL" > "$backup_dir/restored-table-counts.tsv"
diff -u "$backup_dir/production-table-counts.tsv" "$backup_dir/restored-table-counts.tsv" > "$backup_dir/restore-table-counts.diff" || { echo "::error::Restored table counts do not match production"; exit 1; }
migration_history "$TEMP_RESTORE_DATABASE_URL" > "$backup_dir/restored-migrations.tsv"
diff -u "$backup_dir/production-migrations.tsv" "$backup_dir/restored-migrations.tsv" > "$backup_dir/restore-migrations.diff" || { echo "::error::Restored migration history does not match production"; exit 1; }

echo "Backup and restore drill PASS"
echo "Private backup directory: $backup_dir"
echo "Checksum: $(cut -d ' ' -f 1 "$checksum_file")"
echo "Schema, migration-history, and seed-inventory comparisons are saved beside the archive."
