#!/usr/bin/env bash
set -Eeuo pipefail
export PGDATABASE="${DATABASE_URL##*/}" PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres
psql -X -v ON_ERROR_STOP=1 <<'SQL'
CREATE DATABASE vmx_backup_source;
CREATE DATABASE vmx_backup_local;
SQL
fixture='CREATE TABLE "_prisma_migrations" (migration_name text, checksum text, finished_at timestamptz, rolled_back_at timestamptz, started_at timestamptz); INSERT INTO "_prisma_migrations" VALUES (\x27fixture\x27, \x27abc\x27, now(), NULL, now()); CREATE TABLE "SeedHistory" (key text); INSERT INTO "SeedHistory" VALUES (\x27fixture-seed\x27); CREATE TABLE "Product" (id text, name text); INSERT INTO "Product" VALUES (\x271\x27, \x27fixture\x27);'
export PRODUCTION_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vmx_backup_source'
export LOCAL_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vmx_backup_local'
export TEMP_RESTORE_ADMIN_URL="$DATABASE_URL"
export TEMP_RESTORE_DATABASE_URL='postgresql://postgres:postgres@localhost:5432/vmx_restore_ci'
export BACKUP_DIR="$(mktemp -d)"
for url in "$PRODUCTION_DATABASE_URL" "$LOCAL_DATABASE_URL"; do
  printf '%b\n' "$fixture" | PGDATABASE="${url##*/}" psql -X -v ON_ERROR_STOP=1 >/dev/null
done
bash scripts/db-audit-backup.sh
test "$(find "$BACKUP_DIR" -name verified.json | wc -l)" -eq 1
test "$(psql -XAt -c "SELECT count(*) FROM pg_database WHERE datname='vmx_restore_ci'")" -eq 0
# Existing targets must survive a rejected run.
psql -X -v ON_ERROR_STOP=1 -c 'CREATE DATABASE vmx_restore_ci' >/dev/null
if bash scripts/db-audit-backup.sh; then echo 'Expected existing-target rejection'; exit 1; fi
test "$(psql -XAt -c "SELECT count(*) FROM pg_database WHERE datname='vmx_restore_ci'")" -eq 1
psql -X -v ON_ERROR_STOP=1 -c 'DROP DATABASE vmx_restore_ci' >/dev/null
# A pg_restore failure must never produce a success marker.
fake_bin="$(mktemp -d)"
printf '#!/bin/bash\nif [[ "$1" == --list ]]; then exec %q "$@"; fi\nexit 1\n' "$(command -v pg_restore)" > "$fake_bin/pg_restore"
chmod +x "$fake_bin/pg_restore"
if PATH="$fake_bin:$PATH" bash scripts/db-audit-backup.sh; then echo 'Expected restore failure'; exit 1; fi
test "$(find "$BACKUP_DIR" -name verified.json | wc -l)" -eq 1
test "$(psql -XAt -c "SELECT count(*) FROM pg_database WHERE datname='vmx_restore_ci'")" -eq 0
rm -rf "$fake_bin" "$BACKUP_DIR"
